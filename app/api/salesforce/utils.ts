import {
  ChatSessionResponse,
  EntityFieldMap,
  SalesforceChatUserData,
  PrechatDetail,
} from "@/types/salesforce";

export const SALESFORCE_ALLOWED_MESSAGE_TYPES = [
  // 'ChatRequestSuccess',
  // 'ChatEstablished',
  // 'TransferToButtonInitiated',
  // 'ChatEstablished',
  "ChatTransferred",
  "QueueUpdate",
  "AgentTyping",
  "AgentNotTyping",
  "ChatMessage",
  "ChatEnded",
];
export const SALESFORCE_API_BASE_HEADERS = {
  "X-LIVEAGENT-API-VERSION": "34",
  "Access-Control-Allow-Origin": "*",
};

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
      throw new Error("Failed to send chat message");
    }

    return response;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
}

export const SESSION_CREDENTIALS_REQUEST_HEADERS = {
  "X-LIVEAGENT-API-VERSION": "34",
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

export const convertMessagesToTranscriptText = (messages: any[]): string => {
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

export const generateSessionInitRequestBody = (
  chatSessionCredentials: ChatSessionResponse,
  userData: SalesforceChatUserData,
  organizationId: string,
  deploymentId: string,
  buttonId: string,
  eswLiveAgentDevName: string,
  sessionKey: string,
) => {
  const visibleFields = [
    ["First Name", userData.firstName, "First_Name__c"],
    ["Last Name", userData.lastName, "Last_Name__c"],
    ["Email", userData.email, "Email__c"],
    ["Location Id", userData.locationId, "Location_Id__c"],
  ];

  const hiddenFields: [string, string | boolean, string][] = [
    ["Session Id", sessionKey, "Session_Id__c"],
    ["User Id", userData.userId, "User_Id__c"],
    ["Location Type", userData.locationType, "Location_Type__c"],
    ["Origin", "Chat", ""],
    ["eswLiveAgentDevName", eswLiveAgentDevName, ""],
    ["hasOnlyExtraPrechatInfo", false, ""],
  ];

  const prechatDetails = [
    ...visibleFields.map(([label, value, field]) =>
      createPrechatDetail(label, value as string, true, field ? [field] : []),
    ),
    ...hiddenFields.map(([label, value, field]) =>
      createPrechatDetail(label, value, false, field ? [field] : []),
    ),
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
    userAgent: userData.userAgent,
    language: userData.language,
    screenResolution: userData.screenResolution,
    visitorName: userData.firstName,
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
      originalReferrer: "https://www.tripadvisor.com/",
      pages: [
        {
          location: "https://www.jscache.com/static/t4b/support_chat.html",
          time: Date.now(),
        },
      ],
    },
  };
};
