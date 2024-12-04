"use client";

import { useState, useActionState, useCallback } from "react";
import { type AskStreamActionEvent } from "mavenagi/api";
import Form from "next/form";
import { Button } from "@magi/ui";
import { cn } from "@magi/ui/src/lib/utils";
import { submitBailoutForm } from "@/app/actions";
import { useParams } from "next/navigation";

export default function BailoutFormDisplay({
  action,
  conversationId,
}: {
  action: AskStreamActionEvent;
  conversationId: string;
}) {
  const { orgFriendlyId, id: agentId } = useParams();
  const formActionCallback = useCallback(
    (formData: FormData) => {
      formData.append("actionFormId", action.id);
      formData.append("orgFriendlyId", orgFriendlyId as string);
      formData.append("agentId", agentId as string);
      formData.append("conversationId", conversationId as string);
      return submitBailoutForm(null, formData);
    },
    [orgFriendlyId, agentId, conversationId, action.id],
  );

  const [state, formAction] = useActionState(
    (_state: any, formData: FormData) => {
      return formActionCallback(formData);
    },
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  return (
    <div className="">
      {!state && (
        <>
          <h2 className="text-xl font-bold mb-4">{action.formLabel}</h2>
          <Form
            action={formAction}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {action.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id={field.id}
                  name={field.id}
                  defaultValue={field.suggestion}
                  required={field.required}
                  className={cn([
                    // Basic layout
                    "relative block w-full appearance-none rounded-lg px-[calc(theme(spacing[3])-1px)] py-[calc(theme(spacing[1.5])-1px)]",

                    // Typography
                    "text-sm/[21px] text-zinc-950 placeholder:text-zinc-500",

                    // Border
                    "border border-zinc-950/10 data-[hover]:border-zinc-950/20",

                    // Background color
                    "bg-transparent",

                    // Hide default focus styles
                    "focus:outline-none",

                    // Invalid state
                    "data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500",

                    // Disabled state
                    "data-[disabled]:border-zinc-950/20",
                  ])}
                  aria-describedby={`${field.id}-description`}
                />
                {field.description && (
                  <p
                    id={`${field.id}-description`}
                    className="text-sm text-gray-500"
                  >
                    {field.description}
                  </p>
                )}
              </div>
            ))}
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              className="w-full bg-[--brand-color]"
            >
              {isSubmitting ? "Submitting..." : action.submitLabel}
            </Button>
          </Form>
        </>
      )}

      {state && (
        <div
          className={`mt-4 p-3 ${state.success ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"} border rounded`}
          role="alert"
        >
          <strong className="font-bold">
            {state.success ? "Success: " : "Error: "}
          </strong>
          <span>{state.success ? "Submitted successfully!" : state.error}</span>
        </div>
      )}
    </div>
  );
}
