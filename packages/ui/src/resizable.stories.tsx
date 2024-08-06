import type {Meta, StoryObj} from '@storybook/react'

import {Card, CardBody} from './card'
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from './resizable'

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ResizablePanelGroup>

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup direction="vertical" className="min-h-[400px] min-w-[400px] rounded-lg border">
      <ResizablePanel defaultSize={25}>
        <Card className="h-full">
          <CardBody>One</CardBody>
        </Card>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <Card className="h-full">
          <CardBody>Two</CardBody>
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="min-h-[400px] min-w-[400px] rounded-lg border">
      <ResizablePanel>
        <Card className="h-full">
          <CardBody>One</CardBody>
        </Card>
      </ResizablePanel>
      {/* horizontal handle has a bug; withHandle doesn't work well */}
      <ResizableHandle />
      <ResizablePanel>
        <Card className="h-full">
          <CardBody>Two</CardBody>
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}
