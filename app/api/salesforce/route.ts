import { type NextRequest, NextResponse } from "next/server";

import { getAppSettings, sendChatMessage } from "@/app/api/salesforce/utils";

import type { ChatSessionResponse } from "@/lib/salesforce/types";

const SESSION_CREDENTIALS_REQUEST_HEADERS = {
  "X-LIVEAGENT-API-VERSION": "34",
  "X-LIVEAGENT-AFFINITY": "",
  "Access-Control-Allow-Origin": "*",
};

const SESSION_INIT_REQUEST_HEADERS = {
  ...SESSION_CREDENTIALS_REQUEST_HEADERS,
  "Content-Type": "application/json",
  "X-LIVEAGENT-SEQUENCE": "1",
};

const generateSessionInitRequestHeaders = (
  key: string,
  affinityToken: string,
) => ({
  ...SESSION_INIT_REQUEST_HEADERS,
  "X-LIVEAGENT-SESSION-KEY": key,
  "X-LIVEAGENT-AFFINITY": affinityToken,
});

const convertMessagesToTranscriptText = (messages: any[]): string => {
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

const generateSessionInitRequestBody = (
  chatSessionCredentials: ChatSessionResponse,
  userData: SalesforceChatUserData,
  organizationId: string,
  deploymentId: string,
  buttonId: string,
  eswLiveAgentDevName: string,
  sessionKey: string,
) => ({
  organizationId,
  deploymentId,
  buttonId,
  sessionId: chatSessionCredentials.id,
  trackingId: "",
  userAgent: userData.userAgent,
  language: "en-US",
  screenResolution: userData.screenResolution,
  visitorName: [userData.firstName, userData.lastName].join(" "),
  prechatDetails: [
    {
      label: "Last Name",
      value: userData.lastName,
      entityMaps: [],
      displayToAgent: true,
      doKnowledgeSearch: false,
      transcriptFields: ["Last_Name__c"],
    },
    {
      label: "First Name",
      value: userData.firstName,
      entityMaps: [],
      displayToAgent: true,
      doKnowledgeSearch: false,
      transcriptFields: ["First_Name__c"],
    },
    {
      label: "Email",
      value: userData.email,
      entityMaps: [],
      displayToAgent: true,
      doKnowledgeSearch: false,
      transcriptFields: ["Email__c"],
    },
    {
      label: "Location Id",
      value: userData.locationId,
      entityMaps: [],
      displayToAgent: true,
      doKnowledgeSearch: false,
      transcriptFields: ["Location_Id__c"],
    },
    {
      label: "Session Id",
      value: sessionKey,
      entityMaps: [],
      displayToAgent: false,
      doKnowledgeSearch: false,
      transcriptFields: ["Session_Id__c"],
    },
    {
      label: "User Id",
      value: userData.userId,
      entityMaps: [],
      displayToAgent: false,
      doKnowledgeSearch: false,
      transcriptFields: ["User_Id__c"],
    },
    {
      label: "Location Type",
      value: userData.locationType,
      entityMaps: [],
      displayToAgent: false,
      doKnowledgeSearch: false,
      transcriptFields: ["Location_Type__c"],
    },
    {
      label: "Origin",
      value: "Chat",
      entityMaps: [],
      displayToAgent: false,
      doKnowledgeSearch: false,
      transcriptFields: [],
    },
    {
      label: "eswLiveAgentDevName",
      value: eswLiveAgentDevName,
      entityMaps: [],
      displayToAgent: false,
      doKnowledgeSearch: false,
      transcriptFields: [],
    },
    {
      label: "hasOnlyExtraPrechatInfo",
      value: false,
      entityMaps: [],
      displayToAgent: false,
      doKnowledgeSearch: false,
      transcriptFields: [],
    },
  ],
  buttonOverrides: [],
  receiveQueueUpdates: true,
  prechatEntities: [],
  isPost: false,
  //   visitorInfo: {
  //     visitCount: 1,
  //     originalReferrer: 'https://www.tripadvisor.com',
  //     pages: [
  //       {
  //         location: 'https://www.jscache.com/static/t4b/support_chat.html',
  //         epoch: Date.now(),
  //       },
  //     ],
  //   },
  //   prechatEntities: [
  //     {
  //       entityName: 'Contact',
  //       showOnCreate: true,
  //       linkToEntityName: '',
  //       linkToEntityField: 'ContactId',
  //       saveToTranscript: 'ContactId',
  //       entityFieldMaps: [
  //         {
  //           fieldName: 'FirstName',
  //           label: 'First Name',
  //           doFind: true,
  //           isExactMatch: true,
  //           doCreate: false,
  //         },
  //         {
  //           fieldName: 'LastName',
  //           label: 'Last Name',
  //           doFind: true,
  //           isExactMatch: true,
  //           doCreate: false,
  //         },
  //         {
  //           fieldName: 'Email',
  //           label: 'Email',
  //           doFind: true,
  //           isExactMatch: true,
  //           doCreate: false,
  //         },
  //       ],
  //     },
  //   ],
});

type SalesforceChatUserData = {
  email: string;
  firstName: string;
  lastName: string;
  locationId: string;
  locationType: string;
  question: string;
  screenResolution: string;
  subject: string;
  userAgent: string;
  userId: string;
};

type SalesforceRequest = {
  userData: SalesforceChatUserData;
  messages: any[];
  orgFriendlyId: string;
  agentId: string;
};

// initializing salesforce chat session
export async function POST(req: NextRequest) {
  const { userData, messages, orgFriendlyId, agentId } =
    (await req.json()) as SalesforceRequest;
  const {
    salesforceChatHostUrl: url,
    salesforceChatButtonId,
    salesforceDeploymentId,
    salesforceOrgId,
    salesforceEswLiveAgentDevName,
  } = (await getAppSettings(orgFriendlyId, agentId)) as AppSettings;

  try {
    const chatSessionCredentialsResponse = await fetch(
      url + "/chat/rest/System/SessionId",
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
      userData,
      salesforceOrgId,
      salesforceDeploymentId,
      salesforceChatButtonId,
      salesforceEswLiveAgentDevName,
      chatSessionCredentials.key,
    );
    console.log("requestBody", requestBody);

    const chatSessionInitResponse = await fetch(
      url + "/chat/rest/Chasitor/ChasitorInit",
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
      url,
    );

    return NextResponse.json({
      ...chatSessionCredentials,
    });
  } catch (error) {
    console.log("initiateChatSession failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const affinityToken = req.headers.get("X-LIVEAGENT-AFFINITY");
  const key = req.headers.get("X-LIVEAGENT-SESSION-KEY");
  const orgFriendlyId = req.headers.get("X-ORGANIZATION-ID") as string;
  const agentId = req.headers.get("X-AGENT-ID") as string;
  const { salesforceChatHostUrl: url } = (await getAppSettings(
    orgFriendlyId,
    agentId,
  )) as AppSettings;
  try {
    if (!affinityToken || !key) {
      return Response.json("Missing auth headers", {
        status: 401,
      });
    }

    const chatSessionEndResponse = await fetch(
      url + `/chat/rest/System/SessionId/${key}`,
      {
        method: "DELETE",
        headers: generateSessionInitRequestHeaders(key, affinityToken),
      },
    );

    if (!chatSessionEndResponse.ok) {
      console.log("Failed to end chat session", chatSessionEndResponse);
      throw new Error("Failed to end chat session");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("endChatSession failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
