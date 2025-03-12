import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@magi/ui/src/form/select";
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";

// Store the original method to restore it later
const originalScrollIntoView = Element.prototype.scrollIntoView;

// Mock scrollIntoView which is causing the error
beforeAll(() => {
  // Mock the scrollIntoView method
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  // Restore the original scrollIntoView method
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

describe("Select Component", () => {
  const setup = () => {
    const onValueChangeMock = vi.fn();
    const utils = render(
      <Select onValueChange={onValueChangeMock} defaultValue="apple">
        <SelectTrigger className="test-trigger-class">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent className="test-content-class">
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectContent>
      </Select>,
    );

    return {
      ...utils,
      onValueChangeMock,
      trigger: screen.getByRole("combobox"),
    };
  };

  it("renders the select trigger correctly", () => {
    const { trigger } = setup();
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass("test-trigger-class");
  });

  it("displays the default value", () => {
    setup();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("opens the dropdown when clicked", async () => {
    const { trigger } = setup();

    // Initially, content should not be in the document
    expect(screen.queryByText("Banana")).not.toBeInTheDocument();

    // Click to open the dropdown
    fireEvent.click(trigger);

    // Wait for the content to appear
    await waitFor(() => {
      expect(screen.getByText("Banana")).toBeVisible();
      expect(screen.getByText("Orange")).toBeVisible();
    });
  });

  it("selects an item when clicked", async () => {
    const { trigger, onValueChangeMock } = setup();

    // Open the dropdown
    fireEvent.click(trigger);

    // Wait for the content to appear and click on an item
    await waitFor(() => {
      const bananaOption = screen.getByText("Banana");
      fireEvent.click(bananaOption);
    });

    // Check if onValueChange was called with the correct value
    expect(onValueChangeMock).toHaveBeenCalledWith("banana");
  });

  it("closes the dropdown after selection", async () => {
    const { trigger } = setup();

    // Open the dropdown
    fireEvent.click(trigger);

    // Wait for the content to appear and click on an item
    await waitFor(() => {
      const bananaOption = screen.getByText("Banana");
      fireEvent.click(bananaOption);
    });

    // Check if the dropdown is closed
    await waitFor(() => {
      expect(screen.queryByText("Orange")).not.toBeInTheDocument();
    });
  });

  it("applies custom classes to components", async () => {
    const { trigger } = setup();

    // Open the dropdown
    fireEvent.click(trigger);

    // Check for custom classes
    await waitFor(() => {
      const content = screen.getByRole("listbox");
      expect(content).toHaveClass("test-content-class");
    });
  });

  it("handles disabled state", () => {
    render(
      <Select disabled defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("displays placeholder when no value is selected", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByText("Select a fruit")).toBeInTheDocument();
  });
});
