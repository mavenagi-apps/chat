'use client'

import React from 'react'
import {createContext, useContext, useState} from 'react'

import {cn} from './lib/utils'
import {Link} from './link'

export function Table({
  className,
  children,
  ...props
}: {
  bleed?: boolean
} & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div {...props} className={cn('overflow-x-auto pb-[5px]', className)}>
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full text-left text-sm/5">{children}</table>
      </div>
    </div>
  )
}

export function TableHead({
  sticky = false,
  className,
  ...props
}: {sticky?: boolean} & React.ComponentPropsWithoutRef<'thead'>) {
  return (
    <thead
      className={cn(
        'bg-gray-50 text-xs font-semibold uppercase text-gray-500',
        className,
        sticky ? 'sticky top-0 z-10' : ''
      )}
      {...props}
    />
  )
}

export function TableBody(props: React.ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} />
}

const TableRowContext = createContext<{
  href?: string
  target?: string
  title?: string
}>({
  href: undefined,
  target: undefined,
  title: undefined,
})

export function TableRow({
  href,
  target,
  title,
  className,
  children,
  shadowOnHover,
  ...props
}: {
  href?: string
  target?: string
  title?: string
  shadowOnHover?: boolean
} & React.ComponentPropsWithoutRef<'tr'>) {
  return (
    <TableRowContext.Provider value={{href, target, title} as React.ContextType<typeof TableRowContext>}>
      <tr
        {...props}
        className={cn(
          (href || props.onClick || shadowOnHover) && [
            'has-[[data-row-link][data-focus]]:outline has-[[data-row-link][data-focus]]:outline-2 has-[[data-row-link][data-focus]]:-outline-offset-2 has-[[data-row-link][data-focus]]:outline-blue-500 dark:focus-within:bg-white/[2.5%]',
            'hover:bg-zinc-950/[2.5%] dark:hover:bg-white/[2.5%]',
            'hover:shadow-[0px_2px_4px_-4px_rgba(0,0,0,0.14),0px_0px_2px_0px_rgba(0,0,0,0.12)]',
          ],
          'border-b border-zinc-950/5 last:border-b-0 dark:border-white/5',
          className
        )}
      >
        {children}
      </tr>
    </TableRowContext.Provider>
  )
}

export function TableHeader({className, ...props}: React.ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      {...props}
      className={cn('border-b border-b-zinc-950/10 px-4 py-3 font-semibold dark:border-b-white/10', className)}
    />
  )
}

export function TableHeader2({className, ...props}: React.ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      {...props}
      className={cn(
        'border-t-2 border-t-zinc-950/10 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500',
        className
      )}
    />
  )
}

export function TableHeader3({className, ...props}: React.ComponentPropsWithoutRef<'th'>) {
  return (
    <th {...props} className={cn('bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500', className)} />
  )
}

export function TableCell({className, children, ...props}: React.ComponentPropsWithoutRef<'td'>) {
  const {href, target, title} = useContext(TableRowContext)
  const [cellRef, setCellRef] = useState<HTMLElement | null>(null)

  return (
    <td ref={href ? setCellRef : undefined} {...props} className={cn('relative px-4 py-3', className)}>
      {href && (
        <Link
          data-row-link
          href={href}
          target={target}
          aria-label={title}
          tabIndex={cellRef?.previousElementSibling === null ? 0 : -1}
          className="absolute inset-0 focus:outline-none"
        />
      )}
      {children}
    </td>
  )
}
