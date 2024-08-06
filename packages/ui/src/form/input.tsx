'use client'

import {Input as HeadlessInput, type InputProps as HeadlessInputProps} from '@headlessui/react'

import {cn} from '../lib/utils'
import {asControlledComponent} from './as-controlled-component'

const dateTypes = ['date', 'datetime-local', 'month', 'time', 'week']
type DateType = (typeof dateTypes)[number]

export type InputProps = {
  type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' | DateType
  icon?: React.ElementType
  rightIcon?: React.ElementType
} & HeadlessInputProps
export const Input = asControlledComponent<InputProps>(
  ({className, icon: Icon, rightIcon: RightIcon, ...props}: InputProps) => (
    <span
      data-slot="control"
      className={cn([
        // Basic layout
        'relative block w-full',

        // Focus ring
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-violet-700',

        // Background color
        'bg-gray-50',

        // Disabled state
        'has-[[data-disabled]]:opacity-50 before:has-[[data-disabled]]:bg-zinc-950/5 before:has-[[data-disabled]]:shadow-none',

        // Invalid state
        'before:has-[[data-invalid]]:shadow-red-500/10',

        className,
      ])}
    >
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="size-5 text-gray-500" />
        </div>
      )}
      {RightIcon && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <RightIcon className="size-5 text-gray-500" />
        </div>
      )}
      <HeadlessInput
        className={cn([
          // Date classes
          props.type &&
            dateTypes.includes(props.type) && [
              '[&::-webkit-datetime-edit-fields-wrapper]:p-0',
              '[&::-webkit-date-and-time-value]:min-h-[1.5em]',
              '[&::-webkit-datetime-edit]:inline-flex',
              '[&::-webkit-datetime-edit]:p-0',
              '[&::-webkit-datetime-edit-year-field]:p-0',
              '[&::-webkit-datetime-edit-month-field]:p-0',
              '[&::-webkit-datetime-edit-day-field]:p-0',
              '[&::-webkit-datetime-edit-hour-field]:p-0',
              '[&::-webkit-datetime-edit-minute-field]:p-0',
              '[&::-webkit-datetime-edit-second-field]:p-0',
              '[&::-webkit-datetime-edit-millisecond-field]:p-0',
              '[&::-webkit-datetime-edit-meridiem-field]:p-0',
            ],

          // Basic layout
          'relative block w-full appearance-none rounded-lg px-[calc(theme(spacing[3])-1px)] py-[calc(theme(spacing[1.5])-1px)]',

          props.type === 'color' && 'h-full px-[calc(theme(spacing[1])-2px)] py-0',

          // Typography
          'text-sm/[21px] text-zinc-950 placeholder:text-zinc-500',

          // Border
          'border border-zinc-950/10 data-[hover]:border-zinc-950/20',

          // Background color
          'bg-transparent',

          // Hide default focus styles
          'focus:outline-none',

          // Invalid state
          'data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500',

          // Disabled state
          'data-[disabled]:border-zinc-950/20',

          Icon && 'pl-[calc(theme(spacing[10])-1px)] sm:pl-[calc(theme(spacing[10])-1px)]',

          RightIcon && 'pr-[calc(theme(spacing[10])-1px)] sm:pr-[calc(theme(spacing[10])-1px)]',
        ])}
        {...props}
      />
    </span>
  ),
  {}
)
