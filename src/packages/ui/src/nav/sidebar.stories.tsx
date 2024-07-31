import {MenuItem as HeadlessMenuItem} from '@headlessui/react'
import type {Meta, StoryObj} from '@storybook/react'
import {HiUsers} from 'react-icons/hi'

import {Dropdown} from '../dropdown'
import {Link} from '../link'
import {
  Sidebar,
  SidebarBackButton,
  SidebarItem,
  SidebarItemGroup,
  SidebarMenuButton,
  SidebarMenuItems,
  type SidebarProps,
} from './sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'Nav/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {
  args: {
    className: 'border-r',
  },
  render: (args: SidebarProps) => (
    <div className="flex h-[500px] w-[800px] flex-row border bg-gray-50">
      <div className="flex w-64">
        <Sidebar {...args}>
          <SidebarBackButton href="/go-back">Go Back</SidebarBackButton>
          <nav className="flex-1">
            <SidebarItemGroup>
              <SidebarItem>Inactive</SidebarItem>
              <SidebarItem href="/">Inactive Link</SidebarItem>
              <SidebarItem active={true}>Active</SidebarItem>
            </SidebarItemGroup>
          </nav>
          <Dropdown>
            <SidebarMenuButton>
              <HiUsers data-slot="icon" />
              Menu Button
            </SidebarMenuButton>
            <SidebarMenuItems>
              <HeadlessMenuItem
                as={Link}
                href="/"
                type={undefined}
                className="block px-4 py-2 text-sm font-normal hover:bg-gray-100 data-[focus]:bg-gray-100"
              >
                Item Name
              </HeadlessMenuItem>
            </SidebarMenuItems>
          </Dropdown>
        </Sidebar>
      </div>
      <div className="flex-1"></div>
    </div>
  ),
}
