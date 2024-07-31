'use client'

import {ChevronUpDownIcon, ChevronUpIcon} from '@heroicons/react/20/solid'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type Table as RTTable,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'

import {Checkbox} from '../form/checkbox'
import {cn} from '../lib/utils'
import {Skeleton} from '../skeleton'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../table'
import {DataTablePagination} from './data-table-pagination'
import {DataTableViewOptions} from './data-table-view-options'

export interface Page<T> {
  size: number
  content: T[]
  number: number
  totalElements: number
  totalPages: number
}

export interface QueryState {
  page: number
  size?: number
  sortId?: string
  sortDesc?: boolean
}

const rowSelectorColumn = <TData,>(
  enableMultiRowSelection?: boolean | ((row: Row<TData>) => boolean)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<TData, any>[] => [
  // TODO(amol): render radio button column for single row selection
  {
    id: 'select',
    header: ({table}) =>
      enableMultiRowSelection && (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          // [xiao]: not sure why using onChange doesn't work...
          onClick={table.getToggleAllRowsSelectedHandler()}
          aria-label="Select all"
          className="align-top"
        />
      ),
    cell: ({row}) =>
      enableMultiRowSelection && (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
          className="align-top"
        />
      ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      cellClassName: 'py-3 px-0 pl-4 align-top',
      headerClassName: 'px-0 w-2 pl-4',
    },
  },
]
export type RowSelectionProps<TData> =
  | {
      enableRowSelection?: false
      enableMultiRowSelection?: never
    }
  | {
      enableRowSelection: true | ((row: Row<TData>) => boolean)
      enableMultiRowSelection?: boolean | ((row: Row<TData>) => boolean)
    }
export type UseDataTableProps<TData> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  data?: Page<TData> | TData[]
  className?: string
  emptyMessage?: React.ReactNode
  queryState?: QueryState
  setQueryState?: React.Dispatch<React.SetStateAction<QueryState>>
} & RowSelectionProps<TData>
export const useDataTable = <TData,>(props: UseDataTableProps<TData>) => {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    Object.fromEntries(
      props.columns
        .filter(column => column.meta?.defaultVisibility !== undefined)
        .map(column => [
          // @ts-expect-error accessorKey is optional
          (column.accessorKey !== undefined ? column.accessorKey.replaceAll('.', '_') : undefined) ??
            column.id ??
            column.header,
          column.meta!.defaultVisibility!,
        ])
    )
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const data = Array.isArray(props.data)
    ? {content: props.data, size: props.data.length, number: 0, totalElements: props.data.length, totalPages: 1}
    : props.data

  const table = useReactTable({
    data: data?.content ?? [],
    columns: props.enableRowSelection
      ? rowSelectorColumn<TData>(props.enableMultiRowSelection).concat(props.columns)
      : props.columns,
    state: {
      sorting:
        props.queryState && props.queryState.sortId !== undefined && props.queryState.sortDesc !== undefined
          ? [
              {
                id: props.queryState.sortId,
                desc: props.queryState.sortDesc,
              },
            ]
          : [],
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: props.queryState?.page ?? 0,
        pageSize: props.queryState?.size ?? 20,
      },
    },
    onPaginationChange:
      props.setQueryState && props.queryState
        ? updaterOrValue => {
            let paginationState: PaginationState
            if (typeof updaterOrValue === 'function') {
              paginationState = updaterOrValue({
                pageIndex: props.queryState!.page,
                pageSize: props.queryState!.size ?? 20,
              })
            } else {
              paginationState = updaterOrValue
            }
            props.setQueryState!(prevState => ({
              ...prevState,
              page: paginationState.pageIndex,
              size: paginationState.pageSize,
            }))
          }
        : undefined,
    onSortingChange:
      props.setQueryState && props.queryState
        ? updaterOrValue => {
            let sortingState: SortingState
            if (typeof updaterOrValue === 'function') {
              sortingState = updaterOrValue(
                props.queryState!.sortId !== undefined && props.queryState!.sortDesc !== undefined
                  ? [
                      {
                        id: props.queryState!.sortId,
                        desc: props.queryState!.sortDesc,
                      },
                    ]
                  : []
              )
            } else {
              sortingState = updaterOrValue
            }

            props.setQueryState!(prevState => ({
              ...prevState,
              sortId: sortingState.length > 0 ? sortingState[0].id : undefined,
              sortDesc: sortingState.length > 0 ? sortingState[0].desc : undefined,
            }))
          }
        : undefined,
    pageCount: data ? Math.trunc((data.totalElements + data.size - 1) / data.size) : 0,
    manualPagination: true,
    manualSorting: true,
    enableSorting: props.setQueryState !== undefined && props.queryState !== undefined,
    enableRowSelection: props.enableRowSelection,
    enableMultiRowSelection: props.enableMultiRowSelection,
    enableSortingRemoval: false,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 0,
    },
  })
  return {table, isPending: data === undefined}
}

export type DataTableProps<TData> = {
  table: {table: RTTable<TData>; isPending: boolean}
  className?: string
  emptyMessage?: React.ReactNode
  enablePagination?: boolean
  rowPage?: (item: TData) => string | undefined
  rowOnClick?: (item: TData) => void
  rowHighlight?: (item: TData, isSelected: boolean) => boolean
  showHideColumns?: boolean
  eyebrow?: React.ReactNode
  tabs?: React.ReactNode
}
export function DataTable<TData>({
  table: {table, isPending},
  className,
  emptyMessage,
  enablePagination = true,
  rowPage,
  rowOnClick,
  rowHighlight,
  showHideColumns,
  eyebrow,
  tabs,
}: DataTableProps<TData>) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex flex-1 flex-col">
        {tabs}
        {(eyebrow || showHideColumns) && (
          <div className="flex flex-row items-center justify-between border-b border-b-zinc-950/10">
            <div className="flex flex-grow flex-row items-center gap-4 px-3 py-1.5">{eyebrow}</div>
            {showHideColumns && (
              <div className="flex flex-row items-center gap-4 px-3 py-1.5">
                <DataTableViewOptions table={table} />
              </div>
            )}
          </div>
        )}
        <Table>
          <colgroup>
            {table.getVisibleLeafColumns().map(column => (
              <col key={column.id} className={column.columnDef.meta?.colClassName} />
            ))}
          </colgroup>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHeader
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'group whitespace-nowrap',
                        header.column.getCanSort() && 'cursor-pointer',
                        header.column.columnDef.meta?.headerClassName
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && header.column.getIsSorted() !== false && (
                            <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
                              <ChevronUpIcon
                                width="15"
                                height="15"
                                className={
                                  header.column.getIsSorted() === 'desc' ? 'inline-block' : 'inline-block rotate-180'
                                }
                              />
                            </span>
                          )}
                          {header.column.getCanSort() && header.column.getIsSorted() === false && (
                            <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                              <ChevronUpDownIcon width="15" height="15" className="inline-block" />
                            </span>
                          )}
                        </>
                      )}
                    </TableHeader>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isPending
              ? Array.from({length: table.getState().pagination.pageSize}).map((_, i) => (
                  <TableRow key={i}>
                    {table.getVisibleLeafColumns().map(column => (
                      <TableCell key={column.id} className={column.columnDef.meta?.cellClassName}>
                        <Skeleton className="h-4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : table.getRowModel().rows.map(row => (
                  <TableRow
                    href={rowPage?.(row.original)}
                    key={row.id}
                    // We do onClick in TableCell to exclude the checkbox selection column
                    shadowOnHover={true}
                    data-state={row.getIsSelected() && 'selected'}
                    className={
                      rowHighlight?.(row.original, row.getIsSelected())
                        ? 'border-2 border-violet-700 bg-violet-700 bg-opacity-10 hover:bg-violet-950/[20%]'
                        : ''
                    }
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.cellClassName}
                        onClick={
                          cell.column.columnDef.id !== 'select'
                            ? () => rowOnClick?.(row.original)
                            : row.getToggleSelectedHandler()
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {!isPending && table.getRowModel().rows.length === 0 && (
          <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-2 text-center">
            {emptyMessage}
          </div>
        )}
      </div>
      {enablePagination && <DataTablePagination table={table} />}
    </div>
  )
}
