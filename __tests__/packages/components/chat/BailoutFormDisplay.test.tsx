import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, expect, test, beforeEach } from "vitest";
import BailoutFormDisplay from "@/packages/components/chat/BailoutFormDisplay";
import { type AskStreamActionEvent } from "mavenagi/api";
import { RouterProvider } from "@test-utils/test-utils";
import { submitBailoutForm } from "@/app/actions";
import { createBotMessage } from "@/__tests__/lib/handoff/test-utils";
import type { ConversationMessageResponse } from "mavenagi/api";

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
    onSubmitSuccess: vi.fn(),
  };

  return render(
    <RouterProvider>
      <BailoutFormDisplay {...defaultProps} {...props} />
    </RouterProvider>,
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
    const mockActionForTest = {
      ...mockActionWithFields,
      submitLabel: "Submit Form",
    };

    vi.mocked(submitBailoutForm).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: {},
                actionFormResponse: createBotMessage([
                  { type: "text", text: "Success" },
                ]) as ConversationMessageResponse.Bot,
              }),
            100,
          ),
        ),
    );

    renderComponent({ action: mockActionForTest });

    const submitButton = screen.getByRole("button", { name: "Submit Form" });

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Submitting...");

    await waitFor(() => {
      expect(screen.getByText(/Success:/i)).toBeInTheDocument();
    });
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
