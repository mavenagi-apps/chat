import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import {
  PageBody,
  PageContainer,
  PageHeader,
  PageHeaderTools,
  PageSubtitle,
  PageTitle,
} from "./page";

const meta: Meta = {
  title: "Page",
  component: React.Fragment,
  tags: ["autodocs"],
  args: {
    pageTitle: "Page Title",
    pageSubtitle: "Page Subtitle",
  },
};
export default meta;

export const Default: StoryObj<{
  pageTitle: string;
  pageSubtitle: string;
}> = {
  render: (args) => (
    <React.Fragment>
      <div className="h-[500px] w-[800px] border border-red-500">
        <PageContainer>
          <PageHeader>
            <PageTitle>
              {args.pageTitle}
              <PageHeaderTools>
                <button>Button 1</button>
                <button>Button 2</button>
              </PageHeaderTools>
            </PageTitle>
            <PageSubtitle>{args.pageSubtitle}</PageSubtitle>
          </PageHeader>
          <PageBody>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <p>Paragraph 2</p>
          </PageBody>
        </PageContainer>
      </div>
    </React.Fragment>
  ),
};
