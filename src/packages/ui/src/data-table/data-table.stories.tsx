import type {Meta, StoryObj} from '@storybook/react'
import {createColumnHelper} from '@tanstack/react-table'

import {Card, CardBody, CardSubtitle, CardTitle, CardTitleActions} from '../card'
import {DataTable, useDataTable} from './data-table'

const meta: Meta<typeof DataTable> = {
  title: 'DataTable',
  component: DataTable,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof DataTable>

type TestItem = {
  id: string
  description: string
  count: number
  createdBy: string
}

const columnHelper = createColumnHelper<TestItem>()
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
  }),
  columnHelper.accessor('description', {
    header: 'Description',
  }),
  columnHelper.accessor('count', {
    header: 'Count',
    enableSorting: true,
  }),
  columnHelper.accessor('createdBy', {
    header: 'Created By',
    meta: {defaultVisibility: false},
  }),
]

const testData: TestItem[] = [
  {id: 'foo_1', description: 'Item A', count: 1, createdBy: 'Alice'},
  {id: 'bar_2', description: 'Item B', count: 2, createdBy: 'Bob'},
  {id: 'baz_3', description: 'Item C', count: 3, createdBy: 'Charlie'},
]

type RowSelectionOption = false | 'multi' | 'single'
const testTable = (rowSelectionOption?: RowSelectionOption) =>
  !rowSelectionOption
    ? useDataTable({
        data: {
          size: testData.length,
          content: testData,
          number: 1,
          totalElements: testData.length,
          totalPages: 1,
        },
        columns,
      })
    : useDataTable({
        data: {
          size: testData.length,
          content: testData,
          number: 1,
          totalElements: testData.length,
          totalPages: 1,
        },
        columns,
        enableRowSelection: true,
        enableMultiRowSelection: true,
      })

export const Default: Story = {
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
          <DataTable table={testTable()}></DataTable>
        </Card>
      </CardBody>
    </Card>
  ),
}

export const WithHighlight: Story = {
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
        <DataTable table={testTable()} rowHighlight={row => row.id === 'bar_2'}></DataTable>
      </CardBody>
    </Card>
  ),
}

export const MultiRowSelectionWithHighlight: Story = {
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
        <DataTable
          table={testTable(/* rowSelectionOption= */ 'multi')}
          rowHighlight={row => row.id === 'foo_1'}
        ></DataTable>
      </CardBody>
    </Card>
  ),
}
