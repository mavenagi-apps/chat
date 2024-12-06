"use server";

import { getMavenAGIClient } from "@/app/index";
import { type MavenAGIClient, type MavenAGI } from "mavenagi";
import { type FeedbackType } from "mavenagi/api";
import { nanoid } from "nanoid";

interface CreateOrUpdateFeedbackProps {
  orgFriendlyId: string;
  agentId: string;
  feedbackId: string | undefined;
  conversationId: string;
  conversationMessageId: string;
  feedbackType?: FeedbackType;
  feedbackText?: string;
}

export async function createOrUpdateFeedback({
  orgFriendlyId,
  agentId,
  feedbackId,
  conversationId,
  conversationMessageId,
  feedbackType,
  feedbackText,
}: CreateOrUpdateFeedbackProps) {
  const client: MavenAGIClient = getMavenAGIClient(orgFriendlyId, agentId);

  const feedbackRequest = {
    feedbackId: {
      referenceId: feedbackId || nanoid(),
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
    const parsedHandoffConfiguration = JSON.parse(handoffConfiguration);

    if (!parsedHandoffConfiguration.type) {
      return undefined;
    }

    return {
      type: parsedHandoffConfiguration.type,
    };
  } catch (error) {
    console.error("Error parsing handoff configuration:", error);
    return undefined;
  }
};

export async function getPublicAppSettings(
  orgFriendlyId: string,
  agentId: string,
): Promise<ClientSafeAppSettings | null> {
  if (!orgFriendlyId || !agentId) {
    return null;
  }

  const client = getMavenAGIClient(orgFriendlyId, agentId);
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
      orgFriendlyId,
      agentId,
      conversationId,
      actionFormId,
      ...parameters
    } = Object.fromEntries(formData.entries());
    const client = getMavenAGIClient(
      orgFriendlyId as string,
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
