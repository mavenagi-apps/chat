import {cn} from './lib/utils'

export type CardProps = React.ComponentPropsWithoutRef<'div'>
export const Card = ({className, ...props}: CardProps) => {
  return (
    <div
      className={cn(
        'bg-bg-primary -mx-[--gutter] flex flex-col divide-y divide-gray-200 overflow-hidden border border-gray-200 shadow-sm sm:mx-0 sm:rounded-lg',
        className
      )}
      {...props}
    />
  )
}

export type CardHeaderProps = React.ComponentPropsWithoutRef<'h3'>
export const CardHeader = ({className, ...props}: CardHeaderProps) => {
  return (
    <h3
      className={cn(
        'flex flex-col flex-wrap items-stretch justify-between gap-2 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase leading-6 text-gray-500 sm:flex-row sm:flex-nowrap sm:items-center',
        className
      )}
      {...props}
    />
  )
}

export type CardHeaderToolsProps = React.ComponentPropsWithoutRef<'div'>
export const CardHeaderTools = ({className, ...props}: CardHeaderToolsProps) => {
  return (
    <div
      className={cn(
        'flex flex-col flex-wrap items-stretch gap-2 text-base font-normal sm:flex-row sm:items-center',
        className
      )}
      {...props}
    />
  )
}

export type CardBodyProps = React.ComponentPropsWithoutRef<'div'>
export const CardBody = ({className, ...props}: CardBodyProps) => {
  return (
    <div
      className={cn(
        'relative flex flex-grow flex-col gap-4 p-4 [--gutter:theme(spacing.4)] only:p-6 only:[--gutter:theme(spacing.6)]',
        className
      )}
      {...props}
    />
  )
}

export type CardTitleProps = React.ComponentPropsWithoutRef<'h3'>
export const CardTitle = ({className, ...props}: CardTitleProps) => {
  return (
    <h3
      className={cn(
        'text-fg-primary mb-2 flex flex-col flex-wrap justify-between gap-4 text-xl font-bold leading-8 sm:flex-row',
        className
      )}
      {...props}
    />
  )
}

export type CardSubtitleProps = React.ComponentPropsWithoutRef<'h4'>
export const CardSubtitle = ({className, ...props}: CardSubtitleProps) => {
  return <h4 className={cn('-mt-6 mb-2 text-base font-normal leading-6 text-gray-500', className)} {...props} />
}

export const CardTools = ({className, ...props}: React.ComponentPropsWithoutRef<'div'>) => {
  return (
    <div
      className={cn('flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-start', className)}
      {...props}
    />
  )
}

export type CardTitleActionsProps = React.ComponentPropsWithoutRef<'div'>
export const CardTitleActions = ({className, ...props}: CardTitleActionsProps) => {
  return (
    <div
      className={cn(
        'flex flex-col flex-wrap items-stretch gap-2 text-base font-normal sm:flex-row sm:items-center',
        className
      )}
      {...props}
    />
  )
}
