'use client'

import {
  Description as HeadlessDescription,
  type DescriptionProps as HeadlessDescriptionProps,
  Label as HeadlessLabel,
  type LabelProps as HeadlessLabelProps,
  Menu as HeadlessMenu,
  MenuButton as HeadlessMenuButton,
  MenuHeading as HeadlessMenuHeading,
  type MenuHeadingProps as HeadlessMenuHeadingProps,
  MenuItem as HeadlessMenuItem,
  type MenuItemProps as HeadlessMenuItemProps,
  MenuItems as HeadlessMenuItems,
  type MenuItemsProps as HeadlessMenuItemsProps,
  type MenuProps as HeadlessMenuProps,
  MenuSection as HeadlessMenuSection,
  type MenuSectionProps as HeadlessMenuSectionProps,
  MenuSeparator as HeadlessMenuSeparator,
  type MenuSeparatorProps as HeadlessMenuSeparatorProps,
  Transition as HeadlessTransition,
} from '@headlessui/react'
import {CheckIcon} from '@heroicons/react/16/solid'
import React, {type ComponentProps} from 'react'
import {Fragment} from 'react'

import {Button} from './button'
import {UncontrolledCheckbox} from './form/checkbox'
import {cn} from './lib/utils'
import {Link} from './link'

export function Dropdown(props: HeadlessMenuProps) {
  return <HeadlessMenu {...props} />
}

export function DropdownButton<T extends React.ElementType = typeof Button>(
  props: React.ComponentProps<typeof HeadlessMenuButton<T>>
) {
  return <HeadlessMenuButton as={Button} {...props} />
}

const MENU_ITEM_CLASSNAMES = [
  // Anchor positioning
  '[--anchor-gap:theme(spacing.2)] [--anchor-padding:theme(spacing.3)] data-[anchor~=start]:[--anchor-offset:-4px] data-[anchor~=end]:[--anchor-offset:4px]',

  // Base styles
  'isolate w-max rounded-lg p-1',

  // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
  'outline outline-1 outline-transparent focus:outline-none',

  // Handle scrolling when menu won't fit in viewport
  'overflow-y-auto',

  // Popover background
  'bg-white/75 backdrop-blur-xl',

  // Shadows
  'shadow-lg ring-1 ring-zinc-950/10',

  // Define grid at the menu level if subgrid is supported
  'supports-[grid-template-columns:subgrid]:grid supports-[grid-template-columns:subgrid]:grid-cols-[auto_1fr_1.5rem_0.5rem_auto]',
]

type FloatingMenuProps = {
  children: React.ReactNode
  show: boolean
  className?: string
}

export function FloatingMenu({className, show, children}: FloatingMenuProps) {
  return (
    <HeadlessTransition as={Fragment} leave="duration-100 ease-in" leaveTo="opacity-0" show={show}>
      <div className={cn(MENU_ITEM_CLASSNAMES, className)}>{children}</div>
    </HeadlessTransition>
  )
}

export function DropdownMenu({
  anchor = 'bottom',
  ...props
}: {anchor?: NonNullable<HeadlessMenuItemsProps['anchor']>['to']} & Omit<HeadlessMenuItemsProps, 'anchor'>) {
  return (
    <HeadlessTransition as={Fragment} leave="duration-100 ease-in" leaveTo="opacity-0">
      <HeadlessMenuItems
        {...props}
        anchor={{
          to: anchor,
          gap: 'var(--anchor-gap)',
          offset: 'var(--anchor-offset)',
          padding: 'var(--anchor-padding)',
        }}
        className={cn(MENU_ITEM_CLASSNAMES, props.className)}
      />
    </HeadlessTransition>
  )
}

type FloatingItemProps = {
  key: number | string
  href: string
  children: React.ReactNode
  className?: string
}

export function FloatingItem({key, href, children, className}: FloatingItemProps) {
  return (
    <div key={key} className={cn('self-stretch p-1 hover:bg-gray-200', className)}>
      <Link key={key} href={href}>
        {children}
      </Link>
    </div>
  )
}

export function DropdownItem({
  as,
  ...props
}: {href?: string; as?: React.ElementType} & Omit<HeadlessMenuItemProps<'button'>, 'as'>) {
  return (
    <HeadlessMenuItem
      as={as ?? (props.href ? Link : 'button')}
      type={props.href ? undefined : 'button'}
      {...props}
      className={cn(
        // Base styles
        'group cursor-pointer rounded-lg px-3.5 py-2.5 focus:outline-none sm:px-3 sm:py-1.5',

        // Text styles
        'text-left text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',

        // Focus
        'data-[focus]:bg-purple-100 data-[focus]:text-violet-700',

        // Disabled state
        'data-[disabled]:cursor-default data-[disabled]:text-zinc-950 data-[disabled]:opacity-50',

        // Forced colors
        'forced-color-adjust-none forced-colors:data-[focus]:bg-[Highlight] forced-colors:data-[focus]:text-[HighlightText] forced-colors:[&>[data-slot=icon]]:data-[focus]:text-[HighlightText]',

        // Use subgrid when available but fallback to an explicit grid layout if not
        'col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] items-center supports-[grid-template-columns:subgrid]:grid-cols-subgrid',

        // Icon
        '[&>[data-slot=icon]]:col-start-1 [&>[data-slot=icon]]:row-start-1 [&>[data-slot=icon]]:mr-2.5 [&>[data-slot=icon]]:size-5 sm:[&>[data-slot=icon]]:mr-2 [&>[data-slot=icon]]:sm:size-4',
        '[&>[data-slot=icon]]:text-zinc-500 [&>[data-slot=icon]]:data-[focus]:text-violet-700 [&>[data-slot=icon]]:dark:text-zinc-500 [&>[data-slot=icon]]:data-[focus]:dark:text-white',

        props.className
      )}
    />
  )
}

export function DropdownHeader({className, ...props}: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={cn('col-span-5 px-3.5 pb-1 pt-2.5 sm:px-3', className)} />
}

export function DropdownSection({className, ...props}: HeadlessMenuSectionProps) {
  return (
    <HeadlessMenuSection
      {...props}
      className={cn(
        // Define grid at the section level instead of the item level if subgrid is supported
        'col-span-full supports-[grid-template-columns:subgrid]:grid supports-[grid-template-columns:subgrid]:grid-cols-[auto_1fr_1.5rem_0.5rem_auto]',
        className
      )}
    />
  )
}

export function DropdownHeading({className, ...props}: HeadlessMenuHeadingProps) {
  return (
    <HeadlessMenuHeading
      {...props}
      className={cn(
        'col-span-full grid grid-cols-[1fr,auto] gap-x-12 px-3.5 pb-1 pt-2 text-sm/5 font-medium uppercase text-zinc-500 sm:px-3 sm:text-xs/5 dark:text-zinc-400',
        className
      )}
    />
  )
}

export function DropdownSeparator({className, ...props}: HeadlessMenuSeparatorProps) {
  return (
    <HeadlessMenuSeparator
      {...props}
      className={cn(
        'col-span-full -mx-1 my-1 h-px border-0 bg-zinc-950/5 dark:bg-white/10 forced-colors:bg-[CanvasText]',
        className
      )}
    />
  )
}

export function DropdownLabel({className, ...props}: HeadlessLabelProps) {
  return <HeadlessLabel {...props} data-slot="label" className={cn('col-start-2 row-start-1', className)} {...props} />
}

export function DropdownDescription({className, ...props}: HeadlessDescriptionProps) {
  return (
    <HeadlessDescription
      data-slot="description"
      {...props}
      className={cn(
        'col-span-2 col-start-2 row-start-2 text-sm/5 text-zinc-500 group-data-[focus]:text-white sm:text-xs/5 dark:text-zinc-400 forced-colors:group-data-[focus]:text-[HighlightText]',
        className
      )}
    />
  )
}

export function DropdownShortcut({
  className,
  keys,
  ...props
}: {keys: string | string[]} & HeadlessDescriptionProps<'kbd'>) {
  return (
    <HeadlessDescription as="kbd" {...props} className={cn('col-start-5 row-start-1 flex justify-self-end', className)}>
      {(Array.isArray(keys) ? keys : keys.split('')).map((char, index) => (
        <kbd
          key={index}
          className={cn([
            'min-w-[2ch] text-center font-sans capitalize text-zinc-400 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[HighlightText]',

            // Make sure key names that are longer than one character (like "Tab") have extra space
            index > 0 && char.length > 1 && 'pl-1',
          ])}
        >
          {char}
        </kbd>
      ))}
    </HeadlessDescription>
  )
}

export function DropdownCheckboxItem({
  checked,
  onCheckedChange,
  children,
  onClick,
  ...props
}: {checked?: boolean; onCheckedChange?: (checked: boolean) => void} & ComponentProps<typeof DropdownItem>) {
  return (
    <DropdownItem
      {...(checked ? {['data-checked']: ''} : {})}
      aria-checked={checked}
      onClick={event => {
        onClick?.(event)
        onCheckedChange?.(!checked)
      }}
      className={cn(checked && 'data-[checked]:text-purple-700')}
      {...props}
    >
      {bag => (
        <>
          <UncontrolledCheckbox data-slot="icon" checked={checked} hasFocusRing={false} />
          {(typeof children === 'function' ? children : () => children)(bag)}
        </>
      )}
    </DropdownItem>
  )
}

export function DropdownRadioItem({
  checked,
  children,
  ...props
}: {checked?: boolean; onCheckedChange?: (checked: boolean) => void} & ComponentProps<typeof DropdownItem>) {
  return (
    <DropdownItem
      {...(checked ? {['data-checked']: ''} : {})}
      aria-checked={checked}
      className={cn(checked && 'data-[checked]:text-purple-700 [&>[data-slot=icon]]:data-[checked]:text-purple-700')}
      {...props}
    >
      {bag => (
        <>
          {checked ? <CheckIcon /> : <span data-slot="icon" />}
          {(typeof children === 'function' ? children : () => children)(bag)}
        </>
      )}
    </DropdownItem>
  )
}
