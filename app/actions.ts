"use server";

import { getMavenAGIClient } from "@/app/index";
import { type MavenAGIClient, type MavenAGI } from "mavenagi";
import {
  type FeedbackType,
  type ConversationMessageResponse,
} from "mavenagi/api";
import { nanoid } from "nanoid";
import { getAppSettings } from "@/app/api/server/utils";
import { adaptLegacySettings } from "@/lib/settings";
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

function getActionFormResponse(
  actionFormResponse: MavenAGI.ConversationResponse,
  actionFormId: string,
): ConversationMessageResponse.Bot | undefined {
  const actionFormResponseMessage = actionFormResponse.messages.find(
    (message) =>
      message.type === "bot" &&
      message.conversationMessageId.referenceId ===
        `${actionFormId}-actionResponse-1-bot`,
  );

  return actionFormResponseMessage as ConversationMessageResponse.Bot;
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
  handoffConfiguration: AppSettings["misc"]["handoffConfiguration"] | undefined,
): ClientSafeAppSettings["misc"]["handoffConfiguration"] | undefined => {
  if (!handoffConfiguration) {
    return undefined;
  }

  try {
    const parsedHandoffConfiguration = JSON.parse(
      handoffConfiguration,
    ) as ClientSafeAppSettings["misc"]["handoffConfiguration"];

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
    const legacySettings =
      (await client.appSettings.get()) as unknown as InterimAppSettings;
    const settings = adaptLegacySettings(legacySettings);
    const parsedHandoffConfiguration = parseHandoffConfiguration(
      settings.misc?.handoffConfiguration,
    );

    return {
      branding: settings.branding,
      security: {
        embedAllowlist: settings.security?.embedAllowlist,
      },
      misc: {
        amplitudeApiKey: settings.misc?.amplitudeApiKey,
        disableAttachments:
          ["true", "1"].includes(settings.misc?.disableAttachments || "") ??
          false,
        handoffConfiguration: parsedHandoffConfiguration,
        enableIdleMessage:
          ["true", "1"].includes(settings.misc?.enableIdleMessage || "") ??
          false,
      },
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

    const conversationResponse = await client.conversation.submitActionForm(
      conversationId as string,
      request,
    );

    const actionFormResponse = getActionFormResponse(
      conversationResponse,
      actionFormId as string,
    );

    return {
      success: true,
      data: Object.fromEntries(formData),
      actionFormResponse,
    };
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
    const settings = await getAppSettings(organizationId, agentId);

    const strategy = ServerHandoffStrategyFactory.createStrategy(
      settings.misc.handoffConfiguration?.type,
      settings.misc.handoffConfiguration as HandoffConfiguration,
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
