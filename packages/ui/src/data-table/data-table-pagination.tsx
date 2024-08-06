import {type Table} from '@tanstack/react-table'
import {useCallback, useEffect, useRef} from 'react'

import {Select} from '../form/select'
import {cn} from '../lib/utils'
import {Pagination, PaginationNext, PaginationPrevious} from '../pagination'

export type DataTablePaginationProps<TData> = {
  table: Table<TData>
  className?: string
}
export function DataTablePagination<TData>({table, className}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageIndexRef = useRef<HTMLSpanElement>(null)

  const renderPageIndex = useCallback(() => {
    if (pageIndexRef.current) {
      pageIndexRef.current.textContent = (pageIndex + 1).toString()
    }
  }, [pageIndex])
  useEffect(() => {
    renderPageIndex()
  }, [renderPageIndex])

  const pageSizes = [10, 20, 50, 100]
  return (
    <div className={cn('flex items-center justify-between p-4', className)}>
      <div className="flex items-center gap-4">
        <div className="hidden text-sm text-gray-500 sm:block">
          Showing{' '}
          <span className="font-medium text-gray-900">
            {table.getRowModel().rows.length === 0
              ? 0
              : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            -
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
              table.getRowModel().rows.length}
          </span>{' '}
          of{' '}
          <span className="font-medium text-gray-900">
            {/* {table.options.meta?.totalElements ?? table.getFilteredRowModel().rows.length} */}
          </span>
        </div>
        <div>
          <Select
            className="bg-white font-medium text-gray-900"
            value={table.getState().pagination.pageSize.toString()}
            onChange={e => table.setPageSize(Number(e.target.value))}
            defaultValue={10}
          >
            {[
              ...pageSizes,
              ...(pageSizes.includes(table.getState().pagination.pageSize)
                ? []
                : [table.getState().pagination.pageSize]),
            ]
              .toSorted((a, b) => a - b)
              .map(value => (
                <option key={value} value={value}>
                  {value} results
                </option>
              ))}
          </Select>
        </div>
      </div>
      {table.getPageCount() > 1 && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            Page
            <span
              className={cn(
                'relative block',
                'before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow',
                'dark:before:hidden',
                'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-blue-500',
                'inline-flex flex-shrink-0'
              )}
            >
              <span
                className={cn(
                  'relative block appearance-none rounded-lg px-[calc(theme(spacing[3])-1px)] py-[calc(theme(spacing[1.5])-1px)]',
                  'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
                  'border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20',
                  'bg-transparent dark:bg-white/5',
                  'focus:outline-none'
                )}
                ref={pageIndexRef}
                contentEditable
                suppressContentEditableWarning={true}
                inputMode="numeric"
                role="textbox"
                onBlur={e => {
                  let value = parseInt(e.currentTarget.textContent ?? '1', 10)
                  value = Number.isNaN(value) ? 1 : value
                  value = Math.max(1, Math.min(value, table.getPageCount()))
                  table.setPageIndex(value - 1)
                  renderPageIndex()
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
              >
                {pageIndex + 1}
              </span>
            </span>
            {/* of {table.options.meta?.totalPages} */}
          </div>
          <Pagination>
            <PaginationPrevious onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
            <PaginationNext onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
          </Pagination>
        </div>
      )}
    </div>
  )
}
