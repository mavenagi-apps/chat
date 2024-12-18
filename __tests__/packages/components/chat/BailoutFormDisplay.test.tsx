import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, expect, test, beforeEach } from "vitest";
import BailoutFormDisplay from "@/packages/components/chat/BailoutFormDisplay";
import { type AskStreamActionEvent } from "mavenagi/api";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { submitBailoutForm } from "@/app/actions";

const mockAppRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

const mockAction: AskStreamActionEvent = {
  id: "test-action",
  formLabel: "test-form",
  fields: [],
  submitLabel: "test-submit",
};

const mockActionWithFields: AskStreamActionEvent = {
  id: "test-action",
  formLabel: "test-form",
  fields: [
    {
      id: "field1",
      label: "Test Field",
      required: true,
      description: "Test description",
      suggestion: "Default value",
    },
  ],
  submitLabel: "Submit Form",
};

vi.mock("@/app/actions", () => ({
  submitBailoutForm: vi.fn().mockResolvedValue({ success: true }),
}));

const renderComponent = (props = {}) => {
  const defaultProps = {
    action: mockAction,
    conversationId: "test-conversation",
  };

  return render(
    <AppRouterContext.Provider value={mockAppRouter}>
      <BailoutFormDisplay {...defaultProps} {...props} />
    </AppRouterContext.Provider>,
  );
};

describe("BailoutFormDisplay", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("should render the form", () => {
    renderComponent();
    expect(screen.getByText("test-form")).toBeInTheDocument();
    expect(screen.getByRole("form")).toBeInTheDocument();
  });

  test("should render form fields with correct attributes", () => {
    renderComponent({ action: mockActionWithFields });

    const input = screen.getByRole("textbox", { name: /test field/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("value", "Default value");
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  test("should show loading state when form is submitting", async () => {
    renderComponent({ action: mockActionWithFields });

    const submitButton = screen.getByRole("button");
    fireEvent.click(submitButton);

    expect(screen.getByText("Submitting...")).toBeInTheDocument();
  });

  test("should display success message after successful submission", async () => {
    renderComponent({ action: mockActionWithFields });

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Success:/i)).toBeInTheDocument();
      expect(screen.getByText(/submitted successfully!/i)).toBeInTheDocument();
    });
  });

  test("should display error message after failed submission", async () => {
    vi.mocked(submitBailoutForm).mockResolvedValue({
      success: false,
      error: "Submission failed",
    });

    renderComponent({ action: mockActionWithFields });

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
    });
  });
});
