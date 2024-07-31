'use client'

import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/16/solid'
import {format} from 'date-fns'
import * as React from 'react'
import {DayPicker} from 'react-day-picker'

import {cn} from './lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export const Calendar = ({classNames, showOutsideDays = true, ...props}: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      formatters={{
        formatWeekdayName: (weekday, options) => {
          return format(weekday, 'ccc', options)
        },
      }}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-2',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-xs/[18px] text-gray-900 font-bold',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'border-input inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'bg-transparent p-1 opacity-50 hover:opacity-100'
        ),
        nav_icon: 'size-4',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'border-collapse space-y-2',
        head_row: 'flex',
        head_cell: 'py-2 flex items-center justify-center px-1 text-gray-500 flex-1 font-semibold text-xs/[18px]',
        row: 'flex w-full',
        cell: cn(
          'relative h-[34px] w-[41.86px] p-0 text-center text-xs/[18px] font-bold focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-zinc-100 [&:has([aria-selected].day-outside)]:bg-zinc-100/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        day: cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-white transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'h-full w-full p-2 aria-selected:opacity-100'
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-violet-700 text-white hover:bg-zinc-900 hover:text-zinc-50 focus:bg-violet-700 focus:text-white',
        day_outside:
          'day-outside text-zinc-500 opacity-50  aria-selected:bg-zinc-100/50 aria-selected:text-zinc-500 aria-selected:opacity-30',
        day_disabled: 'text-zinc-500 opacity-50',
        day_range_middle: 'aria-selected:bg-zinc-100 aria-selected:text-zinc-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({...props}) => <ArrowLeftIcon {...props} />,
        IconRight: ({...props}) => <ArrowRightIcon {...props} />,
      }}
      {...props}
    />
  )
}
