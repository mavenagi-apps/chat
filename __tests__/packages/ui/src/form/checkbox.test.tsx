import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "@magi/ui/src/form/checkbox";
import { vi, describe, it, expect } from "vitest";

describe("Checkbox Component", () => {
  it("renders the checkbox", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("handles checked state", () => {
    render(<Checkbox defaultChecked />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("handles unchecked state", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("applies custom class name", () => {
    render(<Checkbox className="test-class" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("test-class");
  });

  it("handles click events", () => {
    const onCheckedChangeMock = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChangeMock} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(onCheckedChangeMock).toHaveBeenCalledWith(true);
    expect(onCheckedChangeMock).toHaveBeenCalledTimes(1);
  });

  it("handles disabled state", () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).not.toBeNull();
  });
});
