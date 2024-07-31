import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'

import {DatePicker} from './date-picker'

const meta: Meta<typeof DatePicker> = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof DatePicker>

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>()

    return <DatePicker value={value} onChange={setValue} />
  },
}
