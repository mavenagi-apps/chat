import {
  Tab as HeadlessTab,
  TabGroup as HeadlessTabGroup,
  type TabGroupProps as HeadlessTabGroupProps,
  TabList as HeadlessTabList,
  type TabListProps as HeadlessTabListProps,
  TabPanel as HeadlessTabPanel,
  type TabPanelProps as HeadlessTabPanelProps,
  TabPanels as HeadlessTabPanels,
  type TabPanelsProps as HeadlessTabPanelsProps,
  type TabProps as HeadlessTabProps,
} from '@headlessui/react'
import React from 'react'

import {cn} from './lib/utils'

export type TabGroupProps = HeadlessTabGroupProps
export const TabGroup = HeadlessTabGroup

export type TabListProps = HeadlessTabListProps & {variant?: 'underline' | 'pills'}
export const TabList = ({variant = 'underline', className, ...props}: TabListProps) => (
  <HeadlessTabList
    className={cn(
      'flex flex-row border-b border-gray-200 bg-white',
      variant === 'underline' &&
        'data-[selected]:*:border-fg-brand *:box-border *:px-2 *:pb-[calc(0.75rem-1px)] *:pt-3 *:text-xs/[18px] *:font-semibold *:text-gray-900 *:focus:outline-none data-[selected]:*:-mb-[1px] data-[selected]:*:border-b-2 data-[selected]:*:pb-[calc(0.75rem-2px)]',
      variant === 'pills' &&
        'w-fit divide-x divide-gray-700 overflow-hidden rounded-lg border border-gray-700 bg-white *:px-6 *:py-2 *:text-center *:text-xs *:font-semibold *:leading-none *:text-gray-900 data-[selected]:*:bg-violet-700 data-[selected]:*:text-white',
      className
    )}
    {...props}
  />
)

export type TabProps = HeadlessTabProps
export const Tab = HeadlessTab

export type TabPanelsProps = HeadlessTabPanelsProps
export const TabPanels = HeadlessTabPanels

export type TabPanelProps = HeadlessTabPanelProps
export const TabPanel = HeadlessTabPanel
