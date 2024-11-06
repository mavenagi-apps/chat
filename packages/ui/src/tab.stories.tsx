import type { Meta, StoryObj } from "@storybook/react";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "./tab";

const meta: Meta<typeof Tab> = {
  title: "ui/Tab",
  component: Tab,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Tab>;

export const Underline: Story = {
  args: {},
  render: () => (
    <TabGroup>
      <TabList className="w-[480px]">
        <Tab>Item 1</Tab>
        <Tab>Item 2</Tab>
        <Tab>Item 3</Tab>
        <Tab>Item 4</Tab>
        <Tab>Item 5</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
        <TabPanel>Content 3</TabPanel>
        <TabPanel>Content 4</TabPanel>
        <TabPanel>Content 5</TabPanel>
      </TabPanels>
    </TabGroup>
  ),
};

export const Pills: Story = {
  args: {},
  render: () => (
    <TabGroup>
      <TabList variant="pills">
        <Tab>Item 1</Tab>
        <Tab>Item 2</Tab>
        <Tab>Item 3</Tab>
        <Tab>Item 4</Tab>
        <Tab>Item 5</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
        <TabPanel>Content 3</TabPanel>
        <TabPanel>Content 4</TabPanel>
        <TabPanel>Content 5</TabPanel>
      </TabPanels>
    </TabGroup>
  ),
};
