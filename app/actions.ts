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

export async function getPublicAppSettings(
  orgFriendlyId: string,
  agentId: string,
) {
  const client = getMavenAGIClient(orgFriendlyId, agentId);

  const { amplitudeApiKey } = await client.appSettings.get();
  return { amplitudeApiKey } as Partial<AppSettings>;
}
