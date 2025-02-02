"use server";

import { getMavenAGIClient } from "@/app/index";
import { type MavenAGIClient, type MavenAGI } from "mavenagi";
import { type FeedbackType } from "mavenagi/api";
import { nanoid } from "nanoid";
import { getAppSettings } from "@/app/api/server/utils";
import { ServerHandoffStrategyFactory } from "@/lib/handoff/ServerHandoffStrategyFactory";

interface CreateOrUpdateFeedbackProps {
  organizationId: string;
  agentId: string;
  feedbackId: string | undefined;
  conversationId: string;
  conversationMessageId: string;
  feedbackType?: FeedbackType;
  feedbackText?: string;
  userId?: string;
}

export async function createOrUpdateFeedback({
  organizationId,
  agentId,
  feedbackId,
  conversationId,
  conversationMessageId,
  feedbackType,
  feedbackText,
  userId,
}: CreateOrUpdateFeedbackProps) {
  const client: MavenAGIClient = getMavenAGIClient(organizationId, agentId);

  const feedbackRequest = {
    feedbackId: {
      referenceId: feedbackId || nanoid(),
    },
    userId: {
      referenceId: userId || "",
    },
    conversationId: {
      referenceId: conversationId,
    },
    conversationMessageId: {
      referenceId: conversationMessageId,
    },
    type: feedbackType,
    text: feedbackText,
  };

  try {
    const {
      feedbackId: { referenceId },
    } = await client.conversation.createFeedback(
      feedbackRequest as MavenAGI.FeedbackRequest,
    );
    return referenceId;
  } catch (error) {
    return { error: (error as any)?.message || "Unknown error" };
  }
}

const parseHandoffConfiguration = (
  handoffConfiguration: AppSettings["handoffConfiguration"],
): ClientSafeAppSettings["handoffConfiguration"] | undefined => {
  if (!handoffConfiguration) {
    return undefined;
  }

  try {
    const parsedHandoffConfiguration = JSON.parse(
      handoffConfiguration,
    ) as ClientSafeAppSettings["handoffConfiguration"];

    if (!parsedHandoffConfiguration?.type) {
      return undefined;
    }

    return {
      type: parsedHandoffConfiguration.type,
      surveyLink: parsedHandoffConfiguration.surveyLink,
      enableAvailabilityCheck:
        parsedHandoffConfiguration.enableAvailabilityCheck,
      availabilityFallbackMessage:
        parsedHandoffConfiguration.availabilityFallbackMessage,
      allowAnonymousHandoff: parsedHandoffConfiguration.allowAnonymousHandoff,
    };
  } catch (error) {
    console.error("Error parsing handoff configuration:", error);
    return undefined;
  }
};

export async function getPublicAppSettings(
  organizationId: string,
  agentId: string,
): Promise<ClientSafeAppSettings | null> {
  if (!organizationId || !agentId) {
    return null;
  }

  const client = getMavenAGIClient(organizationId, agentId);
  try {
    const settings = (await client.appSettings.get()) as unknown as AppSettings;
    const parsedHandoffConfiguration = parseHandoffConfiguration(
      settings.handoffConfiguration,
    );

    return {
      amplitudeApiKey: settings.amplitudeApiKey,
      logoUrl: settings.logoUrl,
      popularQuestions: settings.popularQuestions,
      brandColor: settings.brandColor,
      brandFontColor: settings.brandFontColor,
      enableDemoSite: settings.enableDemoSite,
      embedAllowlist: settings.embedAllowlist,
      welcomeMessage: settings.welcomeMessage,
      disableAttachments: settings.disableAttachments,
      // Do not pass the full handoffConfiguration object to the client
      // because it contains sensitive information that should not be exposed
      handoffConfiguration: parsedHandoffConfiguration,
    };
  } catch (error) {
    console.error("Error fetching app settings:", error);
    return null;
  }
}

export async function submitBailoutForm(_prevState: any, formData: FormData) {
  try {
    const {
      organizationId,
      agentId,
      conversationId,
      actionFormId,
      ...parameters
    } = Object.fromEntries(formData.entries());
    const client = getMavenAGIClient(
      organizationId as string,
      agentId as string,
    );

    const request = {
      actionFormId: actionFormId as string,
      parameters,
    };

    await client.conversation.submitActionForm(
      conversationId as string,
      request,
    );
    return { success: true, data: Object.fromEntries(formData) };
  } catch (error) {
    console.error("Error submitting bailout form", error);
    return { success: false, error: "Unknown error" };
  }
}

export async function isHandoffAvailable(
  organizationId: string,
  agentId: string,
) {
  try {
    const { handoffConfiguration } = await getAppSettings(
      organizationId,
      agentId,
    );

    const strategy = ServerHandoffStrategyFactory.createStrategy(
      handoffConfiguration?.type,
      handoffConfiguration as HandoffConfiguration,
    );

    if (!strategy) {
      return true;
    }

    return (await strategy.fetchHandoffAvailability?.()) ?? true;
  } catch (error) {
    console.error("Error checking handoff availability:", error);
    return true;
  }
}
