import type {Meta, StoryObj} from '@storybook/react'
import {HiAcademicCap, HiCamera} from 'react-icons/hi'

import {
  MobileNavbar,
  MobileNavbarBrand,
  MobileNavbarCollapse,
  MobileNavbarItem,
  type MobileNavbarProps,
} from './mobile-navbar'

const meta: Meta<typeof MobileNavbar> = {
  title: 'Nav/MobileNavbar',
  component: MobileNavbar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof MobileNavbar>

export const Default: Story = {
  render: (args: MobileNavbarProps) => (
    <div className="h-[500px] w-[300px] border bg-gray-50">
      <MobileNavbar {...args}>
        {({open}) => (
          <>
            <MobileNavbarBrand>Logo</MobileNavbarBrand>
            <MobileNavbarCollapse open={open}>
              <MobileNavbarItem href="/item-1">
                <div data-slot="icon">
                  <HiAcademicCap />
                </div>
                Item 1
              </MobileNavbarItem>
              <MobileNavbarItem href="/item-2">
                <div data-slot="icon">
                  <HiCamera />
                </div>
                Item 2
              </MobileNavbarItem>
            </MobileNavbarCollapse>
          </>
        )}
      </MobileNavbar>
    </div>
  ),
}
