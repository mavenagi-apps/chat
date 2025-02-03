"use client";

import { useState, useActionState, useCallback } from "react";
import type { ActionFormField, AskStreamActionEvent } from "mavenagi/api";
import Form from "next/form";
import { Button, Input } from "@magi/ui";
import { submitBailoutForm } from "@/app/actions";
import { useParams } from "next/navigation";

export default function BailoutFormDisplay({
  action,
  conversationId,
}: {
  action: AskStreamActionEvent;
  conversationId: string;
}) {
  const { organizationId, agentId } = useParams();
  const formActionCallback = useCallback(
    async (formData: FormData) => {
      formData.append("actionFormId", action.id);
      formData.append("organizationId", organizationId as string);
      formData.append("agentId", agentId as string);
      formData.append("conversationId", conversationId as string);
      return await submitBailoutForm(null, formData);
    },
    [organizationId, agentId, conversationId, action.id],
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

  const fieldType = (field: ActionFormField) => {
    if (field.id.toLowerCase().includes("email")) {
      return "email";
    }
    return "text";
  };

  return (
    <div>
      {!state && (
        <>
          <h2 className="text-xl font-bold mb-4">{action.formLabel}</h2>
          <Form
            role="form"
            action={formAction}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {action.fields?.map((field) => (
              <div key={field.id} className="space-y-2">
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type={fieldType(field)}
                  id={field.id}
                  name={field.id}
                  defaultValue={field.suggestion}
                  required={field.required}
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
