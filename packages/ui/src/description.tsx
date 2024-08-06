import {cn} from './lib/utils'

export type DescriptionTermProps = React.ComponentProps<'dt'>
export const DescriptionTerm = ({className, ...props}: DescriptionTermProps) => (
  <dt className={cn('text-xs font-semibold', className)} {...props} />
)

export type DescriptionDetailsProps = React.ComponentProps<'dd'>
export const DescriptionDetails = ({className, ...props}: DescriptionDetailsProps) => (
  <dd className={cn('flex flex-wrap gap-2 text-xs font-normal', className)} {...props} />
)

export type DescriptionItemProps = React.ComponentProps<'div'>
export const DescriptionItem = ({className, ...props}: DescriptionItemProps) => (
  <div className={cn('flex flex-col gap-1 px-4 py-3', className)} {...props} />
)

export type DescriptionListProps = React.ComponentProps<'dl'>
export const DescriptionList = ({className, ...props}: DescriptionListProps) => (
  <dl className={cn('flex flex-col divide-y divide-gray-200', className)} {...props} />
)
