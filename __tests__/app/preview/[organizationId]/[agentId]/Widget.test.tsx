import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Widget from "@/app/preview/[organizationId]/[agentId]/Widget";

describe("Widget", () => {
  const mockWidgetLoadPayload = {
    organizationId: "test-org",
    agentId: "test-agent",
    envPrefix: "test",
    bgColor: "#000000",
    signedUserData: "signed-data",
    unsignedUserData: {
      name: "Test User",
    },
    customData: {
      key: "value",
    },
  };

  beforeEach(() => {
    // Reset any mocks and clear the DOM
    vi.clearAllMocks();
  });

  it("renders widget script tags", () => {
    const { container } = render(
      <Widget widgetLoadPayload={mockWidgetLoadPayload} />,
    );

    const scripts = container.getElementsByTagName("script");
    expect(scripts).toHaveLength(2);
    expect(scripts[0]).toHaveAttribute("src", "/js/widget.js");
    expect(scripts[0]).toHaveAttribute("defer");
  });

  it("includes today's date with timezone when unsignedUserData exists", () => {
    const { container } = render(
      <Widget widgetLoadPayload={mockWidgetLoadPayload} />,
    );

    const widgetScript = container.getElementsByTagName("script")[1];
    const scriptContent = widgetScript.innerHTML;

    // Verify the script content includes the date with timezone
    expect(scriptContent).toContain("todaysDate");
    expect(scriptContent).toMatch(
      /\d{1,2}\/\d{1,2}\/\d{4},\s+\d{1,2}:\d{2}:\d{2}\s+(AM|PM)\s+[A-Za-z\s]+Time/,
    ); // Date format with timezone check
  });

  it("preserves existing unsigned user data while adding date", () => {
    const { container } = render(
      <Widget widgetLoadPayload={mockWidgetLoadPayload} />,
    );

    const widgetScript = container.getElementsByTagName("script")[1];
    const scriptContent = widgetScript.innerHTML;

    // Check original data is preserved
    expect(scriptContent).toContain('"name":"Test User"');
    // Check date was added
    expect(scriptContent).toContain("todaysDate");
  });

  it("does not add todaysDate when unsignedUserData is undefined", () => {
    const payloadWithoutUnsignedData = {
      ...mockWidgetLoadPayload,
      unsignedUserData: undefined,
    };

    const { container } = render(
      <Widget widgetLoadPayload={payloadWithoutUnsignedData} />,
    );

    const widgetScript = container.getElementsByTagName("script")[1];
    const scriptContent = widgetScript.innerHTML;

    expect(scriptContent).not.toContain("todaysDate");
  });

  it("generates correct widget load script with all payload data", () => {
    const { container } = render(
      <Widget widgetLoadPayload={mockWidgetLoadPayload} />,
    );

    const widgetScript = container.getElementsByTagName("script")[1];
    const scriptContent = widgetScript.innerHTML;

    // Verify all payload properties are included
    expect(scriptContent).toContain('"organizationId":"test-org"');
    expect(scriptContent).toContain('"agentId":"test-agent"');
    expect(scriptContent).toContain('"envPrefix":"test"');
    expect(scriptContent).toContain('"bgColor":"#000000"');
    expect(scriptContent).toContain('"signedUserData":"signed-data"');
    expect(scriptContent).toContain('"key":"value"');
  });

  it("handles payload without optional fields", () => {
    const minimalPayload = {
      organizationId: "test-org",
      agentId: "test-agent",
    };

    const { container } = render(<Widget widgetLoadPayload={minimalPayload} />);

    const widgetScript = container.getElementsByTagName("script")[1];
    const scriptContent = widgetScript.innerHTML;

    // Verify required fields are present
    expect(scriptContent).toContain('"organizationId":"test-org"');
    expect(scriptContent).toContain('"agentId":"test-agent"');
    // Verify optional fields are handled gracefully
    expect(scriptContent).not.toContain('"signedUserData"');
    expect(scriptContent).not.toContain('"bgColor"');
  });
});
