'use client'

import {MenuButton as HeadlessMenuButton} from '@headlessui/react'
import {ViewColumnsIcon} from '@heroicons/react/24/outline'
import {type Table} from '@tanstack/react-table'

import {Dropdown, DropdownCheckboxItem, DropdownHeading, DropdownMenu, DropdownSection} from '../dropdown'

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}
export function DataTableViewOptions<TData>({table}: DataTableViewOptionsProps<TData>) {
  return (
    <Dropdown>
      <HeadlessMenuButton className="flex flex-row items-center gap-2 rounded-lg px-3 py-1.5 text-xs/[18px] font-normal text-gray-700 hover:bg-gray-100">
        Show/Hide columns
        <ViewColumnsIcon className="size-4" />
      </HeadlessMenuButton>
      <DropdownMenu anchor="bottom end">
        <DropdownSection aria-label="Toggle columns">
          <DropdownHeading>Show/Hide Columns</DropdownHeading>
          {table
            .getAllColumns()
            .filter(column => column.getCanHide())
            .map(column => {
              return (
                <DropdownCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={checked => column.toggleVisibility(checked)}
                  onClick={event => event.preventDefault()}
                >
                  {column.columnDef.header?.toString()}
                </DropdownCheckboxItem>
              )
            })}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}
