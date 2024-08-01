'use client'

import {Transition} from '@headlessui/react'
import clsx from 'clsx'
import React, {useState} from 'react'

import {Button} from './button'

export type ExpandablePanelItem = {
  id: string
  icon: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

export type ExpandablePanelProps = {
  items: ExpandablePanelItem[]
  expandedWidth?: string
  className?: string
  defaultOpenItem?: string
  footer?: React.ReactNode
  onCollapse?: () => void
  onExpand?: (id: string) => void
}

export const ExpandablePanel = ({
  items,
  expandedWidth,
  className,
  defaultOpenItem,
  footer,
  onCollapse,
  onExpand,
}: ExpandablePanelProps) => {
  expandedWidth = expandedWidth || ''
  const [openItem, setOpenItem] = useState<string | undefined>(defaultOpenItem)

  function isActiveItem(item: ExpandablePanelItem): boolean {
    return !item.disabled && item.id === openItem
  }
  function onCollapseItem() {
    setOpenItem(undefined)
    onCollapse?.()
  }
  function onExpandItem(id: string) {
    setOpenItem(id)
    onExpand?.(id)
  }

  return (
    <div
      className={clsx(
        `transition-width flex flex-col bg-white text-black duration-500 ease-in-out ${openItem ? expandedWidth : 'w-16'}`,
        className
      )}
    >
      <div className="flex flex-1 flex-shrink overflow-auto">
        <div className="flex flex-none flex-col border-r border-gray-200">
          {items.map(item => (
            <div key={item.id} className="inline-flex h-14 w-16 items-start justify-start">
              <div className="inline-flex h-14 w-16 flex-col items-start justify-start gap-4 bg-white p-2">
                <Button
                  key={item.id}
                  className="inline-flex h-10 w-12 items-center justify-center gap-2 rounded-lg px-3 py-2"
                  variant={isActiveItem(item) ? 'primary' : 'secondary'}
                  disabled={item.disabled}
                  onClick={() => (isActiveItem(item) ? onCollapseItem() : onExpandItem(item.id))}
                  plain={true}
                >
                  <div className="relative h-6 w-6">{item.icon}</div>
                </Button>
              </div>
              {isActiveItem(item) && <div className="h-14 w-1 rounded-bl-2xl rounded-tl-2xl bg-violet-700" />}
            </div>
          ))}
        </div>
        <Transition
          show={Boolean(openItem)}
          enter="transition-opacity duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-50 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="flex-1"
        >
          <div className="h-full flex-1 p-4">{items.find(item => item.id === openItem)?.content}</div>
        </Transition>
      </div>

      {footer && (
        <div
          className={clsx('flex-0 group border-t py-4', openItem !== undefined ? 'px-4' : 'px-3')}
          aria-expanded={openItem !== undefined}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
