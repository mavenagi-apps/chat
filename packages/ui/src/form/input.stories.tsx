import {Field as HeadlessField} from '@headlessui/react'
import {ArrowRightCircleIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline'
import type {Meta, StoryObj} from '@storybook/react'

import {Description, ErrorMessage, Field, Label} from './fieldset'
import {Input} from './input'

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
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
type Story = StoryObj<typeof Input>

export const Basic: Story = {
  render: () => <Input aria-label="Full name" name="full_name" />,
}
export const WithLabel: Story = {
  render: () => (
    <Field>
      <Label>Full name</Label>
      <Input name="full_name" />
    </Field>
  ),
}
export const WithDescription: Story = {
  render: () => (
    <Field>
      <Label>Product name</Label>
      <Description>Use the name you&apos;d like people to see in their cart.</Description>
      <Input name="product_name" />
    </Field>
  ),
}
export const DisabledState: Story = {
  render: () => (
    <Field disabled>
      <Label>Full name</Label>
      <Input name="full_name" />
    </Field>
  ),
}
export const ValidationError: Story = {
  render: () => (
    <Field>
      <Label>Full name</Label>
      <Input name="full_name" invalid />
      <ErrorMessage>This field is required.</ErrorMessage>
    </Field>
  ),
}
export const CustomLayout: Story = {
  render: () => (
    <HeadlessField className="flex items-baseline gap-6">
      <Label>Full name</Label>
      <Input name="full_name" className="flex-1" placeholder=" " />
    </HeadlessField>
  ),
}
export const LeftIcon: Story = {
  render: () => <Input name="search" icon={MagnifyingGlassIcon} />,
}
export const RightIcon: Story = {
  render: () => <Input rightIcon={ArrowRightCircleIcon} />,
}
