'use client'

import {Checkbox as HeadlessCheckbox, type CheckboxProps as HeadlessCheckboxProps} from '@headlessui/react'
import {clsx} from 'clsx'
import React from 'react'

import {cn} from '../lib/utils'
import {asControlledComponent} from './as-controlled-component'

export function CheckboxGroup({className, ...props}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="control"
      {...props}
      className={clsx(
        className,

        // Basic groups
        'space-y-3',

        // With descriptions
        'has-[[data-slot=description]]:space-y-6 [&_[data-slot=label]]:has-[[data-slot=description]]:font-medium'
      )}
    />
  )
}

export type CheckboxProps = {
  className?: string
  hasFocusRing?: boolean
} & HeadlessCheckboxProps

export const UncontrolledCheckbox = ({
  className,
  invalid: _invalid,
  hasFocusRing = true,
  ...props
}: CheckboxProps & {invalid?: boolean}) => {
  return (
    <HeadlessCheckbox data-slot="control" className={cn('group inline-flex focus:outline-none', className)} {...props}>
      <span
        className={clsx([
          // Basic layout
          'relative isolate flex size-4 items-center justify-center rounded-[0.3125rem] bg-gray-50',

          // Background color when checked
          'before:group-data-[checked]:bg-[--checkbox-checked-bg]',

          // Border
          'border border-zinc-950/15 group-data-[checked]:border-transparent group-data-[checked]:group-data-[hover]:border-transparent group-data-[hover]:border-zinc-950/30 group-data-[checked]:bg-[--checkbox-checked-border]',

          // Inner highlight shadow
          'after:absolute after:inset-0 after:rounded-[calc(0.3125rem-1px)] after:shadow-[inset_0_1px_theme(colors.white/15%)]',

          // Focus ring
          hasFocusRing &&
            'group-data-[focus]:outline group-data-[focus]:outline-2 group-data-[focus]:outline-offset-2 group-data-[focus]:outline-blue-500',

          // Disabled state
          'group-data-[disabled]:opacity-50',
          'group-data-[disabled]:border-zinc-950/25 group-data-[disabled]:bg-zinc-950/5 group-data-[disabled]:[--checkbox-check:theme(colors.zinc.950/50%)] group-data-[disabled]:before:bg-transparent',
          'dark:group-data-[disabled]:border-white/20 dark:group-data-[disabled]:bg-white/[2.5%] dark:group-data-[disabled]:[--checkbox-check:theme(colors.white/50%)] dark:group-data-[disabled]:group-data-[checked]:after:hidden',

          // Forced color mode
          'forced-colors:[--checkbox-check:HighlightText] forced-colors:[--checkbox-checked-bg:Highlight] forced-colors:group-data-[disabled]:[--checkbox-check:Highlight]',
          'dark:forced-colors:[--checkbox-check:HighlightText] dark:forced-colors:[--checkbox-checked-bg:Highlight] dark:forced-colors:group-data-[disabled]:[--checkbox-check:Highlight]',

          '[--checkbox-check:theme(colors.white)] [--checkbox-checked-bg:theme(colors.violet.700)] [--checkbox-checked-border:theme(colors.violet.800/90%)]',
        ])}
      >
        <svg
          className="size-3.5 stroke-[--checkbox-check] opacity-0 group-data-[checked]:opacity-100"
          viewBox="0 0 14 14"
          fill="none"
        >
          {/* Checkmark icon */}
          <path
            className="opacity-100 group-data-[indeterminate]:opacity-0"
            d="M3 8L6 11L11 3.5"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Indeterminate icon */}
          <path
            className="opacity-0 group-data-[indeterminate]:opacity-100"
            d="M3 7H11"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </HeadlessCheckbox>
  )
}

export const Checkbox = asControlledComponent<CheckboxProps>(UncontrolledCheckbox, {
  valueAsChecked: true,
  defaultValue: false,
})
