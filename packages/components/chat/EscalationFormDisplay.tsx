import { useContext } from "react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

import { ChatContext } from "./Chat";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  FieldGroup,
  useForm,
} from "@magi/ui";

export default function EscalationFormDisplay() {
  const t = useTranslations("chat.EscalationFormDisplay");
  const [error, setError] = useState<string | null>(null);
  const { initializeHandoff } = useContext(ChatContext);

  const { Form, ...methods } = useForm<{}>({
    onSubmit: async (_data) => {
      try {
        initializeHandoff();
      } catch (error) {
        console.error("Error initiating chat session:", error);
        setError("Failed to initiate chat session. Please try again.");
      }
    },
  });

  if (methods.formState.isSubmitSuccessful) {
    return null;
  }

  return (
    <div>
      {error ? (
        <Alert variant="warning">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Form.Form {...methods}>
          <FieldGroup>
            <Form.SubmitButton
              variant="primary"
              className="w-full bg-[--brand-color]"
            >
              <IoChatbubbleEllipsesOutline />
              {t("connect_to_live_agent")}
            </Form.SubmitButton>
          </FieldGroup>
        </Form.Form>
      )}
    </div>
  );
}
