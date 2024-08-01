import {cn} from './lib/utils'

export const PageContainer = ({className, ...props}: React.ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-1 flex-col gap-6 overflow-auto bg-gray-50 p-6 pb-20', className)} {...props} />
)

export type PageHeaderProps = React.ComponentPropsWithoutRef<'div'>
export const PageHeader = ({className, ...props}: PageHeaderProps) => (
  <div className={cn('flex flex-col gap-3', className)} {...props} />
)

export type PageTitleProps = React.ComponentPropsWithoutRef<'div'>
export const PageTitle = ({className, ...props}: PageTitleProps) => (
  <div
    className={cn(
      'text-fg-primary flex flex-col flex-wrap justify-between gap-3 text-2xl font-bold leading-10 sm:flex-row sm:flex-nowrap',
      className
    )}
    {...props}
  />
)

export type PageSubtitleProps = React.ComponentPropsWithoutRef<'div'>
export const PageSubtitle = ({className, ...props}: PageSubtitleProps) => (
  <div className={cn('flex flex-wrap gap-4 text-sm font-normal leading-5 text-gray-500', className)} {...props} />
)

export type PageBodyProps = React.ComponentPropsWithoutRef<'div'>
export const PageBody = ({className, ...props}: PageBodyProps) => (
  <div className={cn('flex flex-col gap-4', className)} {...props} />
)

export type PageHeaderToolsProps = React.ComponentPropsWithoutRef<'div'>
export const PageHeaderTools = ({className, ...props}: PageHeaderToolsProps) => {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 flex-col flex-wrap items-stretch gap-2 text-base font-normal sm:flex-row sm:items-center',
        className
      )}
      {...props}
    />
  )
}
