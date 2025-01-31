import { useContext, Suspense } from "react";
import { useTranslations } from "next-intl";
import React, { useState, use, useEffect } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSettings } from "@/app/providers/SettingsProvider";
import { isHandoffAvailable } from "@/app/actions";
import { useParams } from "next/navigation";

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

  if (result.success) {
    return result.data ?? true;
  }
  return true;
}

function EscalationForm({ isAvailable }: { isAvailable: boolean }) {
  const t = useTranslations("chat.EscalationFormDisplay");
  const [error, setError] = useState<string | null>(null);
  const { initializeHandoff } = useContext(ChatContext);
  const { isAuthenticated } = useAuth();
  const { handoffConfiguration } = useSettings();
  const { availabilityFallbackMessage = t("agents_unavailable") } =
    handoffConfiguration ?? {};
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
    return <Alert variant="warning">{availabilityFallbackMessage}</Alert>;
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
  const { handoffConfiguration } = useSettings();
  const { organizationId, agentId } = useParams<{
    organizationId: string;
    agentId: string;
  }>();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      const shouldCheckAvailability =
        handoffConfiguration?.enableAvailabilityCheck;
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
