import {
  BeakerIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import type { Meta, StoryObj } from "@storybook/react";

import { ExpandablePanel } from "./expandable-panel";

const meta: Meta<typeof ExpandablePanel> = {
  title: "ExpandablePanel",
  component: ExpandablePanel,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof ExpandablePanel>;

export const Default: Story = {
  args: {},
  render: () => (
    <ExpandablePanel
      items={[
        {
          id: "item1",
          icon: <BeakerIcon />,
          content: <p>Your content for Item 1</p>,
        },
        {
          id: "item2",
          icon: <EllipsisHorizontalIcon />,
          content: <p>Your content for Item 2</p>,
        },
        {
          id: "item3",
          icon: <EllipsisHorizontalIcon />,
          content: <p>Your content for Item 3</p>,
        },
        {
          id: "item4",
          icon: <EllipsisHorizontalIcon />,
          content: <p>Your content for Item 4</p>,
        },
        {
          id: "item5",
          icon: <EllipsisHorizontalIcon />,
          content: <p>Your content for Item 5</p>,
        },
      ]}
    />
  ),
};
