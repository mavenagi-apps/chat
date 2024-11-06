import type { Meta, StoryObj } from "@storybook/react";

import { Link } from "../link";
import {
  DesktopNavbar,
  DesktopNavbarBrand,
  type DesktopNavbarProps,
} from "./desktop-navbar";

const meta: Meta<typeof DesktopNavbar> = {
  title: "Nav/DesktopNavbar",
  component: DesktopNavbar,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof DesktopNavbar>;

export const Default: Story = {
  render: (args: DesktopNavbarProps) => (
    <div className="flex h-[500px] w-[800px] flex-row border bg-gray-50">
      <DesktopNavbar {...args}>
        <DesktopNavbarBrand href="/">Logo</DesktopNavbarBrand>
        <Link href="/">Button 1</Link>
        <Link href="/">Button 2</Link>
      </DesktopNavbar>
    </div>
  ),
};
