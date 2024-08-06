import {Field as HeadlessField} from '@headlessui/react'
import type {Meta, StoryObj} from '@storybook/react'

import {Description, ErrorMessage, Field, Label} from './fieldset'
import {Select} from './select'

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="min-w-[400px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Select>

export const Basic: Story = {
  render: () => (
    <Select aria-label="Project status" name="status" defaultValue="active">
      <option value="active">Active</option>
      <option value="paused">Paused</option>
      <option value="delayed">Delayed</option>
      <option value="canceled">Canceled</option>
    </Select>
  ),
}
export const WithLabel: Story = {
  render: () => (
    <Field>
      <Label>Project status</Label>
      <Select name="status" defaultValue="active">
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="delayed">Delayed</option>
        <option value="canceled">Canceled</option>
      </Select>
    </Field>
  ),
}
export const WithDescription: Story = {
  render: () => (
    <Field>
      <Label>Project status</Label>
      <Description>This will be visible to clients on the project.</Description>
      <Select name="status" defaultValue="active">
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="delayed">Delayed</option>
        <option value="canceled">Canceled</option>
      </Select>
    </Field>
  ),
}
export const DisabledState: Story = {
  render: () => (
    <Field disabled>
      <Label>Project status</Label>
      <Select name="status" defaultValue="active">
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="delayed">Delayed</option>
        <option value="canceled">Canceled</option>
      </Select>
    </Field>
  ),
}
export const ValidationErrors: Story = {
  render: () => (
    <Field>
      <Label>Project status</Label>
      <Select name="status" defaultValue="" invalid>
        <option value="" disabled>
          Select a status&hellip;
        </option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="delayed">Delayed</option>
        <option value="canceled">Canceled</option>
      </Select>
      <ErrorMessage>A project status is required.</ErrorMessage>
    </Field>
  ),
}
export const CustomLayout: Story = {
  render: () => (
    <HeadlessField className="flex items-baseline justify-center gap-6">
      <Label>Project status</Label>
      <Select name="status" defaultValue="active" className="max-w-48">
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="delayed">Delayed</option>
        <option value="canceled">Canceled</option>
      </Select>
    </HeadlessField>
  ),
}
