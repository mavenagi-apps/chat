import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendChatMessage } from "@/app/api/salesforce/utils";
import { withAppSettings } from "@/app/api/server/utils";
import type {
  ChatSessionResponse,
  SalesforceRequest,
} from "@/types/salesforce";
import {
  generateSessionInitRequestBody,
  generateSessionInitRequestHeaders,
  convertMessagesToTranscriptText,
  SESSION_CREDENTIALS_REQUEST_HEADERS,
} from "@/app/api/salesforce/utils";
import { HANDOFF_AUTH_HEADER } from "@/app/constants/authentication";

// initializing salesforce chat session
export async function POST(req: NextRequest) {
  return withAppSettings(req, async (req, settings) => {
    const { handoffConfiguration } = settings;
    if (handoffConfiguration?.type !== "salesforce") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid handoff configuration type. Expected 'salesforce'.",
        },
        { status: 400 },
      );
    }
    const {
      chatHostUrl,
      chatButtonId,
      deploymentId,
      orgId,
      eswLiveAgentDevName,
    } = handoffConfiguration;

    const {
      unsignedUserData: userData,
      messages,
      userAgent,
      screenResolution,
      language,
    } = (await req.json()) as SalesforceRequest;
    if (!userData) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    try {
      const chatSessionCredentialsResponse = await fetch(
        chatHostUrl + "/chat/rest/System/SessionId",
        {
          method: "GET",
          headers: SESSION_CREDENTIALS_REQUEST_HEADERS,
        },
      );

      if (!chatSessionCredentialsResponse.ok) {
        console.log(
          "Failed to initiate chat session",
          chatSessionCredentialsResponse,
        );
        throw new Error("Failed to initiate chat session");
      }

      const chatSessionCredentials: ChatSessionResponse =
        await chatSessionCredentialsResponse.json();

      const requestBody = generateSessionInitRequestBody(
        chatSessionCredentials,
        { ...userData, userAgent, screenResolution, language },
        orgId,
        deploymentId,
        chatButtonId,
        eswLiveAgentDevName,
        chatSessionCredentials.key,
      );
      console.log("requestBody", JSON.stringify(requestBody));

      const chatSessionInitResponse = await fetch(
        chatHostUrl + "/chat/rest/Chasitor/ChasitorInit",
        {
          method: "POST",
          headers: generateSessionInitRequestHeaders(
            chatSessionCredentials.key,
            chatSessionCredentials.affinityToken,
          ),
          body: JSON.stringify(requestBody),
        },
      );

      if (!chatSessionInitResponse.ok) {
        console.log("Failed to initiate chat session", chatSessionInitResponse);
        throw new Error("Failed to initiate chat session");
      }

      // Send messages
      await sendChatMessage(
        convertMessagesToTranscriptText(messages),
        chatSessionCredentials.affinityToken,
        chatSessionCredentials.key,
        chatHostUrl,
      );

      const token = jwt.sign(
        {
          scope: "appUser",
          sessionId: chatSessionCredentials.id,
          sessionKey: chatSessionCredentials.key,
          affinityToken: chatSessionCredentials.affinityToken,
          isAuthenticated: false,
        },
        handoffConfiguration.apiSecret,
        {
          keyid: orgId,
        },
      );

      return NextResponse.json(
        {
          ...chatSessionCredentials,
        },
        {
          headers: {
            [HANDOFF_AUTH_HEADER]: token,
          },
        },
      );
    } catch (error) {
      console.log("initiateChatSession failed:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}

export const maxDuration = 300;
