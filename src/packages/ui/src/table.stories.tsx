import type {Meta, StoryObj} from '@storybook/react'

import {Card, CardBody, CardSubtitle, CardTitle, CardTitleActions} from './card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './table'

const meta: Meta<typeof Table> = {
  title: 'Table',
  component: Table,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Table>

const SampleTable = () => (
  <Table>
    <TableHead>
      <TableRow>
        <TableHeader>Header 1</TableHeader>
        <TableHeader>Header 2</TableHeader>
        <TableHeader>Header 3</TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>Cell 1</TableCell>
        <TableCell>Cell 2</TableCell>
        <TableCell>Cell 3</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Cell 4</TableCell>
        <TableCell>Cell 5</TableCell>
        <TableCell>Cell 6</TableCell>
      </TableRow>
    </TableBody>
  </Table>
)

export const WithoutCard: Story = {
  render: args => (
    <div className="w-[500px]" {...args}>
      <SampleTable />
    </div>
  ),
}

export const InFullCard: Story = {
  render: args => (
    <Card className="w-[500px]" {...args}>
      <SampleTable />
    </Card>
  ),
}

export const InCardBody: Story = {
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
        <SampleTable />
      </CardBody>
    </Card>
  ),
}

export const CardInCardBody: Story = {
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
        <Card>
          <SampleTable />
        </Card>
      </CardBody>
    </Card>
  ),
}
