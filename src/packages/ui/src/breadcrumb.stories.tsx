import type {Meta, StoryObj} from '@storybook/react'

import {Breadcrumb, BreadcrumbItem} from './breadcrumb'

const meta: Meta<typeof Breadcrumb> = {
  title: 'Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Breadcrumb>

export const Default: Story = {
  render: args => (
    <Breadcrumb {...args}>
      <BreadcrumbItem href="/home">Home</BreadcrumbItem>
      <BreadcrumbItem href="/about">About</BreadcrumbItem>
      <BreadcrumbItem>Contact</BreadcrumbItem>
    </Breadcrumb>
  ),
}
