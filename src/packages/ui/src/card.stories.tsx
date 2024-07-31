import type {Meta, StoryObj} from '@storybook/react'

import {Card, CardBody, CardHeader, CardHeaderTools, CardSubtitle, CardTitle, CardTitleActions} from './card'

const meta: Meta<typeof Card> = {
  title: 'Card',
  component: Card,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Card>

export const WithHeader: Story = {
  render: args => (
    <Card className="w-[500px]" {...args}>
      <CardHeader>Card Header</CardHeader>
      <CardBody>Body</CardBody>
    </Card>
  ),
}

export const WithHeaderTools: Story = {
  render: args => (
    <Card className="w-[500px]" {...args}>
      <CardHeader>
        Card Header
        <CardHeaderTools>
          <button>Button 1</button>
          <button>Button 2</button>
        </CardHeaderTools>
      </CardHeader>
      <CardBody>Body</CardBody>
    </Card>
  ),
}

export const WithTitle: Story = {
  render: args => (
    <Card className="w-[500px]" {...args}>
      <CardBody>
        <CardTitle>
          Card Title
          <CardTitleActions>
            <button>Button 1</button>
            <button>Button 2</button>
          </CardTitleActions>
        </CardTitle>
        <CardSubtitle>Card Subtitle</CardSubtitle>
        Card Body
      </CardBody>
    </Card>
  ),
}
