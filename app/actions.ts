'use server';

import { getMavenAGIClient } from '@/app/index';
import { type MavenAGIClient, type MavenAGI } from 'mavenagi';
import { type FeedbackType } from 'mavenagi/api';
import { nanoid } from 'nanoid';

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
      feedbackRequest as MavenAGI.FeedbackRequest
    );
    return referenceId;
  } catch (error) {
    return { error: (error as any)?.message || 'Unknown error' };
  }
}

export async function getPublicAppSettings(
  orgFriendlyId: string,
  agentId: string
) {
  const client = getMavenAGIClient(orgFriendlyId, agentId);

  try {
    const {
      amplitudeApiKey,
      preferredLiveAgentProvider,
      zendeskChatAccountKey,
      zendeskChatIntegrationId,
      zendeskSubdomain,
      escalationTopics,
      logoUrl,
      popularQuestions,
      defaultAgentName,
      brandColor,
      surveyLink,
    } = await client.appSettings.get();
    return {
      amplitudeApiKey,
      preferredLiveAgentProvider,
      zendeskChatAccountKey,
      zendeskChatIntegrationId,
      zendeskSubdomain,
      escalationTopics,
      logoUrl,
      popularQuestions,
      defaultAgentName,
      brandColor,
      surveyLink,
    } as Partial<AppSettings>;
  } catch (error) {
    console.error('Error fetching app settings', error);
    return null;
  }
}

export async function submitBailoutForm(prevState: any, formData: FormData) {
  console.log(prevState, formData);

  try {
    const { orgFriendlyId, agentId, conversationId, actionFormId, ...parameters } = Object.fromEntries(
      formData.entries()
    );
    const client = getMavenAGIClient(orgFriendlyId as string, agentId as string);

    const request = {
      actionFormId: actionFormId as string,
      parameters,
    };
    const response = await client.conversation.submitActionForm(conversationId as string, request);
    console.log(response);
    return { success: true, data: Object.fromEntries(formData) };
  } catch (error) {
    console.error('Error submitting bailout form', error);
    return { success: false, error: 'Unknown error' };
  }
}
