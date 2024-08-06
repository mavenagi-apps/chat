import {Menu as HeadlessMenu} from '@headlessui/react'
import {MenuItem as HeadlessMenuItem, type MenuItemProps as HeadlessMenuItemProps} from '@headlessui/react'
import {
  MenuButton as HeadlessMenuButton,
  MenuItems as HeadlessMenuItems,
  Transition as HeadlessTransition,
} from '@headlessui/react'
import React from 'react'
import {FaBars} from 'react-icons/fa6'
import {HiXMark} from 'react-icons/hi2'

import {cn} from '../lib/utils'
import {Link} from '../link'

export type MobileNavbarProps = {
  className?: string
  children?: React.ComponentProps<typeof HeadlessMenu>['children']
}
export const MobileNavbar = ({className, children}: MobileNavbarProps) => {
  return (
    <HeadlessMenu
      as="div"
      className={cn(
        'bg-bg-primary border-fg-subtle z-10 flex h-16 w-full items-center justify-between border-b px-6',
        className
      )}
    >
      {props => <>{typeof children === 'function' ? children(props) : children}</>}
    </HeadlessMenu>
  )
}

export type MobileNavbarItemProps = {
  className?: string
  href?: string
  as?: 'a'
} & Omit<HeadlessMenuItemProps<'button'>, 'as'>
export const MobileNavbarItem = ({className, as, ...props}: MobileNavbarItemProps) => {
  return (
    <HeadlessMenuItem
      as={as ?? (props.href ? Link : 'button')}
      type={props.href ? undefined : 'button'}
      className={cn(
        'flex items-center px-4 py-2 text-base font-semibold hover:bg-gray-100 data-[focus]:bg-gray-100',
        '[&>[data-slot=icon]]:hover:text-fg-brand [&>[data-slot=icon]]:mr-3 [&>[data-slot=icon]]:flex [&>[data-slot=icon]]:size-8 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:items-center [&>[data-slot=icon]]:justify-center [&>[data-slot=icon]]:rounded-full [&>[data-slot=icon]]:shadow',
        className
      )}
      {...props}
    />
  )
}

export type MobileNavbarCollapseProps = React.PropsWithChildren<{
  open: boolean
  children?: React.ReactNode
}>
export const MobileNavbarCollapse = ({open, children}: MobileNavbarCollapseProps) => {
  return (
    <>
      <HeadlessMenuButton className="item-center hover:bg-bg-secondary size-8 rounded">
        {open ? (
          <HiXMark className="text-fg-primary mx-auto size-8" />
        ) : (
          <FaBars className="text-fg-brand mx-auto size-5" />
        )}
      </HeadlessMenuButton>
      <HeadlessTransition
        as={React.Fragment}
        leave="duration-100 ease-out transform"
        leaveFrom="transform bottom-0"
        leaveTo="transform bottom-[calc(100dvh-4rem)]"
      >
        <HeadlessMenuItems
          anchor={{
            gap: 17,
          }}
          className="inset-0 isolate flex w-full flex-col gap-y-2 overflow-y-auto border-b bg-white p-1 focus:outline-none lg:hidden dark:bg-zinc-800/75"
        >
          {children}
        </HeadlessMenuItems>
      </HeadlessTransition>
    </>
  )
}

export type MobileNavbarBrandProps = React.PropsWithChildren<{className?: string}>
export const MobileNavbarBrand = ({className, children}: MobileNavbarBrandProps) => {
  return (
    <div
      className={cn(
        'text-fg-primary flex flex-1 items-center text-sm font-semibold [&>[data-slot=avatar]]:mr-3 [&>[data-slot=avatar]]:size-10 [&>[data-slot=avatar]]:shrink-0 [&>[data-slot=icon]]:mr-3 [&>[data-slot=icon]]:size-10 [&>[data-slot=icon]]:shrink-0',
        className
      )}
    >
      {children}
    </div>
  )
}
