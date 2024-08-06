'use client'

import type {Meta, StoryObj} from '@storybook/react'

import {Calendar} from './calendar'

const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Calendar>

export const Basic: Story = {
  render: () => <Calendar mode="range" />,
}
