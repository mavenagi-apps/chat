import type {Meta, StoryObj} from '@storybook/react'

import NotFound from './not-found'

const meta = {
  title: 'app/404 - Not Found',
  component: NotFound,
} satisfies Meta<typeof NotFound>
export default meta

type Story = StoryObj<typeof meta>

export const Page: Story = {parameters: {display: 'fullscreen'}}
