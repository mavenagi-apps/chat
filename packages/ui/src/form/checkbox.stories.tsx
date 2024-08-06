import {Field as HeadlessField} from '@headlessui/react'
import type {Meta, StoryObj} from '@storybook/react'

import {Checkbox, CheckboxGroup} from './checkbox'
import {CheckboxField, Description, Fieldset, Label, Legend} from './fieldset'

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
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
type Story = StoryObj<typeof Checkbox>

export const Basic: Story = {
  render: () => <Checkbox aria-label="Allow embedding" name="allow_embedding" />,
}
export const WithLabel: Story = {
  render: () => (
    <CheckboxField>
      <Checkbox name="allow_embedding" />
      <Label>Allow embedding</Label>
    </CheckboxField>
  ),
}
export const WithDescription: Story = {
  render: () => (
    <CheckboxField>
      <Checkbox name="allow_embedding" />
      <Label>Allow embedding</Label>
      <Description>Allow others to embed your event details on their own site.</Description>
    </CheckboxField>
  ),
}
export const CustomLayout: Story = {
  render: () => (
    <HeadlessField className="flex items-center justify-between gap-4">
      <Label>Allow embedding</Label>
      <Checkbox name="allow_embedding" />
    </HeadlessField>
  ),
}
export const IndeterminateState: Story = {
  render: () => (
    <CheckboxGroup role="group" aria-label="Discoverability">
      <CheckboxField>
        <Checkbox checked indeterminate={true} />
        <Label>Select all</Label>
      </CheckboxField>
      <CheckboxField>
        <Checkbox checked />
        <Label>Show on events page</Label>
      </CheckboxField>
      <CheckboxField>
        <Checkbox />
        <Label>Allow embedding</Label>
      </CheckboxField>
    </CheckboxGroup>
  ),
}
export const MultipleCheckboxes: Story = {
  render: () => (
    <CheckboxGroup>
      <CheckboxField>
        <Checkbox name="show_on_events_page" defaultChecked />
        <Label>Show on events page</Label>
        <Description>Make this event visible on your profile.</Description>
      </CheckboxField>
      <CheckboxField>
        <Checkbox name="allow_embedding" />
        <Label>Allow embedding</Label>
        <Description>Allow others to embed your event details on their own site.</Description>
      </CheckboxField>
    </CheckboxGroup>
  ),
}
export const WithFieldset: Story = {
  render: () => (
    <Fieldset>
      <Legend>Discoverability</Legend>
      <CheckboxGroup>
        <CheckboxField>
          <Checkbox name="discoverability" value="show_on_events_page" defaultChecked />
          <Label>Show on events page</Label>
          <Description>Make this event visible on your profile.</Description>
        </CheckboxField>
        <CheckboxField>
          <Checkbox name="discoverability" value="allow_embedding" />
          <Label>Allow embedding</Label>
          <Description>Allow others to embed your event details on their own site.</Description>
        </CheckboxField>
      </CheckboxGroup>
    </Fieldset>
  ),
}
export const DisabledState: Story = {
  render: () => (
    <Fieldset>
      <Legend>Discoverability</Legend>
      <CheckboxGroup>
        <CheckboxField>
          <Checkbox name="discoverability" value="show_on_events_page" />
          <Label>Show on events page</Label>
          <Description>Make this event visible on your profile.</Description>
        </CheckboxField>
        <CheckboxField disabled>
          <Checkbox name="discoverability" value="allow_embedding" />
          <Label>Allow embedding</Label>
          <Description>Allow others to embed your event details on their own site.</Description>
        </CheckboxField>
      </CheckboxGroup>
    </Fieldset>
  ),
}
