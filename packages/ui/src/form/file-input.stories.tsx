import { Field as HeadlessField } from "@headlessui/react";
import type { Meta, StoryObj } from "@storybook/react";

import { Description, Field, Label } from "./fieldset";
import { FileInput } from "./file-input";

const meta: Meta<typeof FileInput> = {
  title: "Forms/File Input",
  component: FileInput,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-w-[400px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof FileInput>;

export const Basic: Story = {
  render: () => <FileInput aria-label="Full name" name="full_name" />,
};
export const WithLabel: Story = {
  render: () => (
    <Field>
      <Label>Full name</Label>
      <FileInput name="full_name" />
    </Field>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <Field>
      <Label>Product name</Label>
      <Description>
        Use the name you&apos;d like people to see in their cart.
      </Description>
      <FileInput name="product_name" />
    </Field>
  ),
};
export const DisabledState: Story = {
  render: () => (
    <Field disabled>
      <Label>Full name</Label>
      <FileInput name="full_name" />
    </Field>
  ),
};
export const CustomLayout: Story = {
  render: () => (
    <HeadlessField className="flex items-baseline gap-6">
      <Label>Full name</Label>
      <FileInput name="full_name" className="flex-1" placeholder=" " />
    </HeadlessField>
  ),
};
