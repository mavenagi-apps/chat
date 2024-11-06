import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  Dropdown,
  DropdownButton,
  DropdownCheckboxItem,
  DropdownHeading,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
} from "./dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  render: () => {
    const Component = () => {
      const [checked, setChecked] = useState(false);
      return (
        <div className="flex flex-row gap-2">
          <Dropdown>
            <DropdownButton variant="secondary">
              Dropdown Button
              <ChevronDownIcon />
            </DropdownButton>
            <DropdownMenu>
              <DropdownItem>Dropdown Item</DropdownItem>
              <DropdownItem disabled>Dropdown Item</DropdownItem>
              <DropdownItem>Dropdown Item</DropdownItem>
              <DropdownSection>
                <DropdownCheckboxItem checked={false}>
                  Dropdown Checkbox Item
                </DropdownCheckboxItem>
                <DropdownCheckboxItem
                  checked={checked}
                  onCheckedChange={setChecked}
                >
                  Dropdown Checkbox Item
                </DropdownCheckboxItem>
                <DropdownCheckboxItem
                  checked={checked}
                  onCheckedChange={setChecked}
                  disabled
                >
                  Dropdown Checkbox Item
                </DropdownCheckboxItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    };
    return <Component />;
  },
};

export const WithHeading: Story = {
  render: () => {
    const Component = () => {
      const [checked, setChecked] = useState(false);
      return (
        <div className="flex flex-row gap-2">
          <Dropdown>
            <DropdownButton variant="secondary">
              Dropdown Button
              <ChevronDownIcon />
            </DropdownButton>
            <DropdownMenu>
              <DropdownSection>
                <DropdownHeading>Section Heading</DropdownHeading>
                <DropdownItem>Dropdown Item</DropdownItem>
                <DropdownItem disabled>Dropdown Item</DropdownItem>
                <DropdownItem>Dropdown Item</DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownCheckboxItem checked={false}>
                  Dropdown Checkbox Item
                </DropdownCheckboxItem>
                <DropdownCheckboxItem
                  checked={checked}
                  onCheckedChange={setChecked}
                >
                  Dropdown Checkbox Item
                </DropdownCheckboxItem>
                <DropdownCheckboxItem
                  checked={checked}
                  onCheckedChange={setChecked}
                  disabled
                >
                  Dropdown Checkbox Item
                </DropdownCheckboxItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    };
    return <Component />;
  },
};
