import {forwardRef} from 'react'

import {cn} from './lib/utils'

export const Alert = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {variant?: 'success' | 'danger' | 'warning' | 'info'}
>(function Alert({className, variant, ...props}, ref) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        '[&>[data-slot=icon]]:text-fg-primary relative flex w-full flex-col gap-1 rounded-lg border p-4 px-4 py-3 text-sm shadow-md ring-1 ring-zinc-950/10 [&>[data-slot=icon]]:absolute [&>[data-slot=icon]]:left-4 [&>[data-slot=icon]]:top-[1.1rem] [&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:translate-y-[-3px] [&>[data-slot=icon]~*]:pl-6',
        variant === 'danger' &&
          'border-fg-danger/50 text-fg-danger dark:border-fg-danger [&>[data-slot=icon]]:text-fg-danger',
        variant === 'success' &&
          'border-fg-success/50 text-fg-success dark:border-fg-success [&>[data-slot=icon]]:text-fg-success',
        variant === 'warning' &&
          'border-fg-warning/50 text-fg-warning dark:border-fg-warning [&>[data-slot=icon]]:text-fg-warning',
        variant === 'info' && 'border-blue-600 bg-sky-100 text-gray-900 [&>[data-slot=icon]]:text-blue-600',
        className
      )}
      {...props}
    />
  )
})

export const AlertTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function AlertTitle({className, ...props}, ref) {
    return (
      <h5 ref={ref} className={cn('font-base font-semibold leading-normal tracking-tight', className)} {...props} />
    )
  }
)

export const AlertDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function AlertDescription({className, ...props}, ref) {
    return <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  }
)
