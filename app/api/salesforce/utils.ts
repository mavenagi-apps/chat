import { NextResponse } from "next/server";
import type { Message } from "@/types";
import type {
  ChatSessionResponse,
  EntityFieldMap,
  SalesforceChatUserData,
  PrechatDetail,
  ChatMessageResponse,
  SalesforceMessageType,
} from "@/types/salesforce";
import { SALESFORCE_MESSAGE_TYPES } from "@/types/salesforce";
import { SALESFORCE_API_VERSION } from "@/app/constants/handoff";

export const SALESFORCE_CHAT_PROMPT_MESSAGE_NAMES = [
  "Management Center",
  "Management Center with Maven",
];

export const SALESFORCE_CHAT_PROMPT_MESSAGE_TEXTS = [
  "Please enter the subject",
];

export const SALESFORCE_ALLOWED_MESSAGE_TYPES: SalesforceMessageType[] = [
  SALESFORCE_MESSAGE_TYPES.ChatRequestFail,
  SALESFORCE_MESSAGE_TYPES.ChatTransferred,
  SALESFORCE_MESSAGE_TYPES.QueueUpdate,
  SALESFORCE_MESSAGE_TYPES.AgentTyping,
  SALESFORCE_MESSAGE_TYPES.AgentNotTyping,
  SALESFORCE_MESSAGE_TYPES.ChatMessage,
  SALESFORCE_MESSAGE_TYPES.ChatEnded,
];

export const SALESFORCE_API_BASE_HEADERS = {
  "X-LIVEAGENT-API-VERSION": SALESFORCE_API_VERSION,
  "Access-Control-Allow-Origin": "*",
};

export class ChatMessagesError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ChatMessagesError";
  }
}

export function validateSalesforceConfig(handoffConfiguration: any) {
  if (handoffConfiguration?.type !== "salesforce") {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid handoff configuration type. Expected 'salesforce'.",
      },
      { status: 400 },
    );
  }
  return null;
}

export function validateAuthHeaders(
  affinityToken: string | undefined,
  sessionKey: string | undefined,
) {
  if (!affinityToken || !sessionKey) {
    return Response.json("Missing auth headers", {
      status: 401,
    });
  }
  return null;
}

export async function sendChatMessage(
  text: string,
  affinityToken: string,
  sessionKey: string,
  url: string,
) {
  const body = JSON.stringify({
    text,
  });

  try {
    const response = await fetch(url + "/chat/rest/Chasitor/ChatMessage", {
      method: "POST",
      headers: {
        ...SALESFORCE_API_BASE_HEADERS,
        "X-LIVEAGENT-AFFINITY": affinityToken,
        "X-LIVEAGENT-SESSION-KEY": sessionKey,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      console.error("Failed to send chat message", response);
      throw new Error("Failed to send chat message");
    }

    return response;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
}

export const SESSION_CREDENTIALS_REQUEST_HEADERS = {
  "X-LIVEAGENT-API-VERSION": SALESFORCE_API_VERSION,
  "X-LIVEAGENT-AFFINITY": "",
  "Access-Control-Allow-Origin": "*",
};

export const SESSION_INIT_REQUEST_HEADERS = {
  ...SESSION_CREDENTIALS_REQUEST_HEADERS,
  "Content-Type": "application/json",
  "X-LIVEAGENT-SEQUENCE": "1",
};

export const generateSessionInitRequestHeaders = (
  key: string,
  affinityToken: string,
) => ({
  ...SESSION_INIT_REQUEST_HEADERS,
  "X-LIVEAGENT-SESSION-KEY": key,
  "X-LIVEAGENT-AFFINITY": affinityToken,
});

export const convertMessagesToTranscriptText = (
  messages: Message[],
): string => {
  let transcriptText = "MAVEN TRANSCRIPT HISTORY\n\n";
  messages.forEach((message) => {
    if (message.type === "USER") {
      transcriptText += `Visitor: ${message.text}\n\n`;
    } else if (message.type === "bot") {
      transcriptText += `Maven bot: ${message.responses.map((r: any) => r.text.replaceAll("\\n", "\n")).join("")}\n\n`;
    }
  });

  return transcriptText.trim();
};

const createPrechatDetail = (
  label: string,
  value: string | boolean,
  displayToAgent: boolean,
  transcriptFields: string[] = [],
): PrechatDetail => ({
  label,
  value,
  entityMaps: [],
  displayToAgent,
  doKnowledgeSearch: false,
  transcriptFields,
});

const createEntityFieldMap = (
  fieldName: string,
  label: string,
): EntityFieldMap => ({
  fieldName,
  label,
  doFind: true,
  isExactMatch: true,
  doCreate: false,
});

export const generateSessionInitRequestBody = ({
  buttonId,
  chatSessionCredentials,
  deploymentId,
  eswLiveAgentDevName,
  language,
  organizationId,
  originalReferrer = "unknown",
  screenResolution,
  sessionKey,
  userAgent,
  userData,
}: {
  buttonId: string;
  chatSessionCredentials: ChatSessionResponse;
  deploymentId: string;
  eswLiveAgentDevName: string;
  language?: string;
  organizationId: string;
  originalReferrer?: string;
  screenResolution: string;
  sessionKey: string;
  userAgent: string;
  userData: SalesforceChatUserData | undefined;
}) => {
  const visibleFields: [string, string | undefined, string][] = [
    ["First Name", userData?.firstName, "First_Name__c"],
    ["Last Name", userData?.lastName, "Last_Name__c"],
    ["Email", userData?.email, "Email__c"],
    ["Location Id", userData?.locationId, "Location_Id__c"],
  ];

  const hiddenFields: [string, string | boolean | undefined, string][] = [
    ["Session Id", sessionKey, "Session_Id__c"],
    ["Origin", "Chat", ""],
    ["eswLiveAgentDevName", eswLiveAgentDevName, ""],
    ["hasOnlyExtraPrechatInfo", false, ""],
    ["Location Type", userData?.locationType, "Location_Type__c"],
    ["User Id", userData?.userId, "User_Id__c"],
  ];

  const prechatDetails = [
    ...visibleFields.map(([label, value, field]) => {
      if (value) {
        return createPrechatDetail(
          label,
          value as string,
          true,
          field ? [field] : [],
        );
      }
      return null;
    }),
    ...hiddenFields.map(([label, value, field]) => {
      if (value) {
        return createPrechatDetail(label, value, false, field ? [field] : []);
      }
      return null;
    }),
  ];

  const entityFieldsMaps = [
    createEntityFieldMap("FirstName", "First Name"),
    createEntityFieldMap("LastName", "Last Name"),
    createEntityFieldMap("Email", "Email"),
  ];

  return {
    organizationId,
    deploymentId,
    buttonId,
    sessionId: chatSessionCredentials.id,
    trackingId: "",
    userAgent,
    language,
    screenResolution,
    visitorName: userData?.firstName,
    prechatDetails,
    buttonOverrides: [],
    receiveQueueUpdates: true,
    isPost: false,
    prechatEntities: [
      {
        entityName: "Contact",
        showOnCreate: true,
        linkToEntityName: "",
        linkToEntityField: "ContactId",
        saveToTranscript: "ContactId",
        entityFieldsMaps,
      },
    ],
    visitorInfo: {
      visitCount: 1,
      originalReferrer,
      pages: [
        {
          location: originalReferrer,
          time: Date.now(),
        },
      ],
    },
  };
};

export async function fetchChatMessages(
  url: string,
  ack: number,
  affinityToken: string,
  sessionKey: string,
): Promise<ChatMessageResponse> {
  const response = await fetch(`${url}/chat/rest/System/Messages?ack=${ack}`, {
    method: "GET",
    headers: {
      ...SALESFORCE_API_BASE_HEADERS,
      "X-LIVEAGENT-AFFINITY": affinityToken,
      "X-LIVEAGENT-SESSION-KEY": sessionKey,
    },
  });

  if (response.status === 204) {
    return {
      messages: [],
      sequence: ack,
      offset: 0,
    };
  }

  if (!response.ok) {
    throw new ChatMessagesError("Failed to get chat messages", response.status);
  }

  const data = await response.json();

  if (process.env.ENABLE_API_LOGGING) {
    console.log("GET MESSAGES RESPONSE", JSON.stringify(data, null, 2));
  }

  return data;
}
