import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ChatBubble } from "@magi/components/chat/ChatCard";

describe("ChatBubble", () => {
  test("renders basic chat bubble with children", () => {
    render(
      <ChatBubble direction="left">
        <div>Test content</div>
      </ChatBubble>,
    );

    expect(screen.getByTestId("chat-bubble")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  test("applies correct classes for right direction", () => {
    const { container } = render(
      <ChatBubble direction="right">
        <div>Test content</div>
      </ChatBubble>,
    );

    const bubble = screen.getByTestId("chat-bubble");
    expect(bubble).toHaveClass("items-end");
    expect(container.querySelector(".sm\\:ml-8")).toBeInTheDocument();
    expect(container.querySelector(".sm\\:w-fit")).toBeInTheDocument();
  });

  test("applies correct classes for left direction", () => {
    const { container } = render(
      <ChatBubble direction="left">
        <div>Test content</div>
      </ChatBubble>,
    );

    const bubble = screen.getByTestId("chat-bubble");
    expect(bubble).not.toHaveClass("items-end");
    expect(container.querySelector(".sm\\:mr-8")).toBeInTheDocument();
  });

  test("applies correct classes for left-hug direction", () => {
    const { container } = render(
      <ChatBubble direction="left-hug">
        <div>Test content</div>
      </ChatBubble>,
    );

    expect(container.querySelector(".sm\\:mr-8")).toBeInTheDocument();
    expect(container.querySelector(".sm\\:w-fit")).toBeInTheDocument();
  });

  test("applies custom className when provided", () => {
    render(
      <ChatBubble direction="left" className="custom-class">
        <div>Test content</div>
      </ChatBubble>,
    );

    const innerBubble = screen.getByTestId("chat-bubble").children[0];
    expect(innerBubble).toHaveClass("custom-class");
  });

  test("displays author when provided", () => {
    render(
      <ChatBubble direction="left" author="John Doe">
        <div>Test content</div>
      </ChatBubble>,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toHaveClass(
      "text-xs",
      "text-gray-500",
    );
  });

  test("does not display author element when author is not provided", () => {
    const { container } = render(
      <ChatBubble direction="left">
        <div>Test content</div>
      </ChatBubble>,
    );

    const authorElements = container.querySelectorAll(".text-gray-500");
    expect(authorElements).toHaveLength(0);
  });

  test("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ChatBubble direction="left" ref={ref}>
        <div>Test content</div>
      </ChatBubble>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-testid", "chat-bubble");
  });
});
