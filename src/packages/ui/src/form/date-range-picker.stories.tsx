import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'
import {type z} from 'zod'

import {DateRangePicker, type dateRangeValueSchema} from './date-range-picker'

const meta: Meta<typeof DateRangePicker> = {
  title: 'Forms/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Basic: Story = {
  render: () => {
    const [range, setRange] = useState<z.infer<typeof dateRangeValueSchema> | undefined>()

    return <DateRangePicker value={range} onChange={setRange} heading="Created date" />
  },
}
