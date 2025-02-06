import { useContext } from "react";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useParams } from "next/navigation";
import { ReactMarkdown } from "@magi/components/ReactMarkdown";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSettings } from "@/app/providers/SettingsProvider";
import { isHandoffAvailable } from "@/app/actions";

import { ChatContext } from "./Chat";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  FieldGroup,
  Input,
  useForm,
} from "@magi/ui";
import Spinner from "@magi/components/Spinner";

async function checkHandoffAvailability(
  organizationId: string,
  agentId: string,
) {
  const result = await isHandoffAvailable(organizationId, agentId);
  return result ?? true;
}

function EscalationForm({ isAvailable }: { isAvailable: boolean }) {
  const t = useTranslations("chat.EscalationFormDisplay");
  const [error, setError] = useState<string | null>(null);
  const { initializeHandoff } = useContext(ChatContext);
  const { isAuthenticated } = useAuth();
  const { misc } = useSettings();
  const availabilityFallbackMessage =
    misc.handoffConfiguration?.availabilityFallbackMessage ??
    t("agents_unavailable");
  const { Form, ...methods } = useForm<{ email?: string }>({
    onSubmit: async (data) => {
      try {
        await initializeHandoff({
          email: isAuthenticated ? undefined : data.email,
        });
      } catch (error) {
        console.error("Error initiating chat session:", error);
        setError("Failed to initiate chat session. Please try again.");
        throw error;
      }
    },
  });

  if (!isAvailable) {
    return (
      <Alert variant="warning" className="[&_a]:underline">
        <ReactMarkdown children={availabilityFallbackMessage as string} />
      </Alert>
    );
  }

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
            {!isAuthenticated && (
              <Input
                {...methods.register("email")}
                required
                name="email"
                placeholder={t("email_placeholder")}
                type="email"
              />
            )}
            <Form.SubmitButton
              variant="primary"
              className="w-full bg-[--brand-color]"
              disabled={methods.formState.isSubmitting}
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

export default function EscalationFormDisplay() {
  const { misc } = useSettings();
  const { organizationId, agentId } = useParams<{
    organizationId: string;
    agentId: string;
  }>();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      const shouldCheckAvailability =
        misc.handoffConfiguration?.enableAvailabilityCheck;
      if (shouldCheckAvailability) {
        const _isAvailable = await checkHandoffAvailability(
          organizationId,
          agentId,
        );
        setIsAvailable(_isAvailable);
      } else {
        setIsAvailable(true);
      }
      setIsLoading(false);
    };

    fetchAvailability();
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  return <EscalationForm isAvailable={isAvailable} />;
}
