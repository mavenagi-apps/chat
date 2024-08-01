import {Field as HeadlessField} from '@headlessui/react'
import type {Meta, StoryObj} from '@storybook/react'

import {Description, ErrorMessage, Field, Label} from './fieldset'
import {Textarea} from './textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
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
type Story = StoryObj<typeof Textarea>

export const Basic: Story = {
  render: () => <Textarea aria-label="Description" name="description" />,
}
export const WithLabel: Story = {
  render: () => (
    <Field>
      <Label>Description</Label>
      <Textarea name="description" />
    </Field>
  ),
}
export const WithDescription: Story = {
  render: () => (
    <Field>
      <Label>Description</Label>
      <Description>This will be shown under the product title.</Description>
      <Textarea name="name" />
    </Field>
  ),
}
export const DisabledState: Story = {
  render: () => (
    <Field disabled>
      <Label>Description</Label>
      <Textarea name="description" />
    </Field>
  ),
}
export const ValidationError: Story = {
  render: () => (
    <Field>
      <Label>Description</Label>
      <Textarea name="description" invalid />
      <ErrorMessage>This field is required.</ErrorMessage>
    </Field>
  ),
}
export const CustomLayout: Story = {
  render: () => (
    <HeadlessField className="grid grid-cols-12 gap-6">
      <div className="col-span-5">
        <Label>Description</Label>
        <Description className="mt-1">This will be shown under the product title.</Description>
      </div>
      <div className="col-span-7">
        <Textarea name="description" rows={3} />
      </div>
    </HeadlessField>
  ),
}
