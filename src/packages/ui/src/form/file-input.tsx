'use client'

import {ErrorMessage as ErrorMessageRHF} from '@hookform/error-message'
import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {useFormContext} from 'react-hook-form'

import {cn} from '../lib/utils'
import {ErrorMessage} from './fieldset'
import {useFormFieldContext} from './form'

export type FileInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {invalid?: boolean}
export const FileInput = (props: FileInputProps) => {
  const formContext = useFormContext()
  const formFieldContext = useFormFieldContext()
  if (!formFieldContext) {
    return <FileInputInner {...props} />
  }
  const {controlId} = formFieldContext
  const {
    register,
    formState: {errors},
    getFieldState,
  } = formContext
  return (
    <>
      <FileInputInner {...register(controlId)} invalid={getFieldState(controlId).invalid} {...props} />
      <ErrorMessageRHF
        errors={errors}
        name={controlId}
        render={({message}) => <ErrorMessage>{message}</ErrorMessage>}
      />
    </>
  )
}

export const FileInputInner = forwardRef<HTMLInputElement>(function FileInputInner(
  {className, invalid = false, ...props}: FileInputProps,
  ref
) {
  return (
    <span
      data-slot="control"
      data-invalid={invalid}
      className={cn([
        'group',
        // Basic layout
        'relative block w-full',

        // Focus ring
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-violet-700',

        // Disabled state
        'has-[[data-disabled]]:opacity-50 before:has-[[data-disabled]]:bg-zinc-950/5 before:has-[[data-disabled]]:shadow-none',

        // Invalid state
        'before:has-[[data-invalid]]:shadow-red-500/10',

        className,
      ])}
    >
      <input
        ref={ref}
        type="file"
        {...(invalid ? {'data-invalid': true} : {})}
        className={cn([
          'cursor-pointer file:-ms-4 file:me-4 file:cursor-pointer file:border-0 file:bg-zinc-900 file:py-2.5 file:pe-4 file:ps-8 file:font-medium file:text-white file:hover:bg-zinc-800',

          // Basic layout
          'relative block w-full appearance-none rounded-lg',

          // Typography
          'text-sm/6 text-zinc-950 placeholder:text-zinc-500 dark:text-white',

          // Border
          'border border-zinc-950/10 group-hover:border-zinc-950/20 dark:border-white/10 dark:group-hover:border-white/20',

          // Background color
          'bg-gray-50',

          // Hide default focus styles
          'focus:outline-none',

          // Invalid state
          'data-[invalid]:border-red-500 data-[invalid]:group-hover:border-red-500 data-[invalid]:dark:border-red-500 data-[invalid]:group-hover:dark:border-red-500',

          // Disabled state
          'data-[disabled]:border-zinc-950/20 data-[disabled]:dark:border-white/15 data-[disabled]:dark:bg-white/[2.5%] dark:group-hover:data-[disabled]:border-white/15',

          'leading-[14px]',
        ])}
        {...props}
      />
    </span>
  )
})
