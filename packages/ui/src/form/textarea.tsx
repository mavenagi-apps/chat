'use client'

import {Textarea as HeadlessTextarea, type TextareaProps as HeadlessTextareaProps} from '@headlessui/react'

import {cn} from '../lib/utils'
import {asControlledComponent} from './as-controlled-component'

type TextareaProps = HeadlessTextareaProps
export const Textarea = asControlledComponent(
  ({className, ...props}: TextareaProps) => (
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

        className,
      ])}
    >
      <HeadlessTextarea
        className={cn([
          // Basic layout
          'relative block h-full w-full appearance-none rounded-lg px-[calc(theme(spacing.3)-1px)] py-[calc(theme(spacing[1.5])-1px)]',

          // Typography
          'text-sm/6 text-zinc-950 placeholder:text-zinc-500',

          // Border
          'border border-zinc-950/10 data-[hover]:border-zinc-950/20',

          // Background color
          'bg-transparent',

          // Hide default focus styles
          'focus:outline-none',

          // Invalid state
          'data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 data-[invalid]:data-[hover]:dark:border-red-600',

          // Disabled state
          'disabled:border-zinc-950/20',
        ])}
        {...props}
      />
    </span>
  ),
  {}
)
