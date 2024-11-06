import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Solid: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="success">Success</Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button variant="primary" disabled>
          Primary
        </Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
        <Button variant="danger" disabled>
          Danger
        </Button>
        <Button variant="warning" disabled>
          Warning
        </Button>
        <Button variant="success" disabled>
          Success
        </Button>
      </div>
    </div>
  ),
};

export const OutlineButtons: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4">
        <Button variant="primary" outline>
          Primary
        </Button>
        <Button variant="secondary" outline>
          Secondary
        </Button>
        <Button variant="danger" outline>
          Danger
        </Button>
        <Button variant="warning" outline>
          Warning
        </Button>
        <Button variant="success" outline>
          Success
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button variant="primary" outline disabled>
          Primary
        </Button>
        <Button variant="secondary" outline disabled>
          Secondary
        </Button>
        <Button variant="danger" outline disabled>
          Danger
        </Button>
        <Button variant="warning" outline disabled>
          Warning
        </Button>
        <Button variant="success" outline disabled>
          Success
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button variant="primary" isProcessing outline>
          Primary
        </Button>
        <Button variant="secondary" isProcessing outline>
          Secondary
        </Button>
        <Button variant="danger" isProcessing outline>
          Danger
        </Button>
        <Button variant="warning" isProcessing outline>
          Warning
        </Button>
        <Button variant="success" isProcessing outline>
          Success
        </Button>
      </div>
    </div>
  ),
};

export const PlainButtons: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4">
        <Button variant="primary" plain>
          Primary
        </Button>
        <Button variant="secondary" plain>
          Secondary
        </Button>
        <Button variant="danger" plain>
          Danger
        </Button>
        <Button variant="warning" plain>
          Warning
        </Button>
        <Button variant="success" plain>
          Success
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button variant="primary" plain disabled>
          Primary
        </Button>
        <Button variant="secondary" plain disabled>
          Secondary
        </Button>
        <Button variant="danger" plain disabled>
          Danger
        </Button>
        <Button variant="warning" plain disabled>
          Warning
        </Button>
        <Button variant="success" plain disabled>
          Success
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button variant="primary" isProcessing plain disabled>
          Primary
        </Button>
        <Button variant="secondary" isProcessing plain disabled>
          Secondary
        </Button>
        <Button variant="danger" isProcessing plain disabled>
          Danger
        </Button>
        <Button variant="warning" isProcessing plain disabled>
          Warning
        </Button>
        <Button variant="success" isProcessing plain disabled>
          Success
        </Button>
      </div>
    </div>
  ),
};

export const LinkButtons: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4">
        <Button link>No Icon</Button>
        <Button link>
          <ArrowUpTrayIcon />
          With Icon
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button link disabled>
          No Icon
        </Button>
        <Button link disabled>
          <ArrowUpTrayIcon />
          With Icon
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button link isProcessing>
          No Icon
        </Button>
        <Button link isProcessing>
          <ArrowUpTrayIcon />
          With Icon
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button link isProcessing disabled>
          No Icon
        </Button>
        <Button link isProcessing disabled>
          <ArrowUpTrayIcon />
          With Icon
        </Button>
      </div>
    </div>
  ),
};

export const Spinner: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4">
        <Button variant="primary" isProcessing>
          Pending
        </Button>
        <Button variant="secondary" outline isProcessing>
          Pending
        </Button>
        <Button variant="danger" plain isProcessing>
          Pending
        </Button>
      </div>
      <div className="flex flex-row items-center gap-4">
        <Button variant="success" isProcessing>
          Pending
        </Button>
        <Button variant="warning" outline isProcessing>
          Pending
        </Button>
      </div>
    </div>
  ),
};
