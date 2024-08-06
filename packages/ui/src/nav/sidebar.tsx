import React from 'react'
import {HiChevronLeft, HiChevronUp} from 'react-icons/hi'

import {Button} from '../button'
import {DropdownMenu} from '../dropdown'
import {cn} from '../lib/utils'
import {Link} from '../link'

export type SidebarItemGroupProps = React.PropsWithChildren<{className?: string}>
export const SidebarItemGroup = ({className, ...props}: SidebarItemGroupProps) => (
  <div className={cn('flex flex-col px-4 py-3', className)} {...props} />
)

export type SidebarItemProps = React.PropsWithChildren<{
  href?: string
  active?: boolean
  parent?: boolean
}>
export const SidebarItem = ({href, children, active, parent}: SidebarItemProps) => {
  const Element = href ? Link : 'div'
  return (
    <Element
      /* @ts-expect-error href */
      href={href}
      className={cn(
        'group/sidebar-item flex flex-row items-center rounded p-2 text-left text-sm',
        '[&>[data-slot=icon]]:mr-3 [&>[data-slot=icon]]:size-4',
        active
          ? `text-fg-primary ${parent ? 'bg-bg-secondary font-semibold' : 'font-medium'} hover:bg-bg-secondary [&>[data-slot=icon]]:text-fg-brand`
          : 'text-fg-secondary hover:bg-bg-secondary [&>[data-slot=icon]]:text-fg-primary [&>[data-slot=icon]]:group-hover/sidebar-item:text-fg-brand font-medium'
      )}
    >
      {children}
    </Element>
  )
}

export type SidebarSubItemProps = React.PropsWithChildren<{href?: string; active?: boolean; className?: string}>
export const SidebarSubItem = ({href, children, active, className}: SidebarSubItemProps) => {
  const Element = href ? Link : 'div'
  return (
    <Element
      /* @ts-expect-error href */
      href={href}
      className={cn(
        'group/sidebar-item flex items-center rounded p-2 text-sm',
        '[&>[data-slot=icon]]:mr-3 [&>[data-slot=icon]]:size-4',
        active
          ? 'text-fg-primary bg-bg-secondary hover:bg-bg-tertiary [&>[data-slot=icon]]:text-fg-brand font-semibold'
          : 'text-fg-secondary hover:bg-bg-secondary [&>[data-slot=icon]]:text-fg-primary [&>[data-slot=icon]]:group-hover/sidebar-item:text-fg-brand font-medium',
        className
      )}
    >
      {children}
    </Element>
  )
}

export type SidebarProps = React.PropsWithChildren<{className?: string; collapsible?: boolean}>
export const Sidebar = ({className, collapsible, ...props}: SidebarProps) => (
  <aside
    className={cn(
      'flex flex-1 flex-col divide-y divide-solid divide-zinc-950/10 overflow-y-auto bg-white',
      'group/sidebar',
      collapsible ? 'collapsible' : 'noncollapsible',
      className
    )}
    {...props}
  />
)

export const SIDEBAR_SHOW_WHEN_COLLAPSED_CLASSNAMES =
  'block group-hover/sidebar:hidden group-[.noncollapsible]/sidebar:hidden'
export const SIDEBAR_SHOW_WHEN_EXPANDED_CLASSNAMES =
  'hidden group-hover/sidebar:block group-[.noncollapsible]/sidebar:block'

export type SidebarBackButtonProps = React.PropsWithChildren<{className?: string; href: string}>
export const SidebarBackButton = ({href, children}: SidebarBackButtonProps) => (
  <Link
    href={href}
    className="text-fg-primary hover:bg-bg-secondary flex items-center px-4 py-6 text-base font-semibold"
  >
    <HiChevronLeft className="mr-2 size-4" />
    <div className="flex-1">{children}</div>
  </Link>
)

export type SidebarMenuButtonProps = React.PropsWithChildren<{
  className?: string
  onClick?: () => void
  active?: boolean
}>
export const SidebarMenuButton = ({className, children, onClick, active}: SidebarMenuButtonProps) => (
  <Button
    plain
    className={cn(
      'text-fg-primary focus-visible:bg-bg-secondary hover:bg-bg-secondary group w-full items-center justify-center rounded-none px-6 py-8 text-left text-sm font-medium focus:outline-none [&>[data-slot=icon]]:size-4',
      className
    )}
    data-slot="menu-button"
    onClick={onClick}
    {...(active ? {'data-active': ''} : {})}
  >
    <div className="flex flex-row">
      <div className="flex flex-1 items-center [&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:group-hover/sidebar:mr-3 [&>[data-slot=icon]]:group-[.noncollapsible]/sidebar:mr-3">
        {children}
      </div>
      <HiChevronUp
        className="hidden size-4 group-hover/sidebar:block group-[.noncollapsible]/sidebar:block [&>[data-slot=icon]]:size-4"
        aria-hidden="true"
      />
    </div>
  </Button>
)

export type SidebarMenuItemsProps = React.PropsWithChildren<{className?: string}>
export const SidebarMenuItems = ({children, className}: SidebarMenuItemsProps) => {
  return (
    <DropdownMenu anchor="top" className={cn('z-[999] min-w-[14rem]', className)}>
      {children}
    </DropdownMenu>
  )
}
