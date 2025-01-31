import { getMavenAGIClient } from "./app";
import { SALESFORCE_API_VERSION } from "./app/constants/handoff";

const ESCALATE_ACTION_ID = "escalate-to-agent";
const ESCALATE_ACTION_NAME = "Escalate to Live Agent";

const defaultModule = {
  async postInstall({
    settings,
    organizationId,
    agentId,
  }: {
    settings: AppSettings;
    organizationId: string;
    agentId: string;
  }) {
    if (!settings.handoffConfiguration) {
      return;
    }

    const client = getMavenAGIClient(organizationId, agentId);
    const escalationTopics: string[] = [];

    try {
      const parsedHandoffConfiguration = JSON.parse(
        settings.handoffConfiguration,
      );
      if (Array.isArray(parsedHandoffConfiguration?.escalationTopics)) {
        parsedHandoffConfiguration.escalationTopics.map((topic: string) => {
          if (typeof topic === "string") {
            escalationTopics.push(topic);
          }
        });
      }
    } catch (e) {
      console.error("Failed to parse ESCALATION_TOPICS", e);
    }

    let description = `This action escalates the conversation to a human support agent via live chat. This will show a button to the user which the user must click to be connected to live chat.

# **Response Instructions for \`escalate\`**
- Always acknowledge the member's question or concern and inform them you will connect them to support when using this action. Include the following text at the end of your reply: "Click the button below to be connected to an agent."
`;

    if (escalationTopics.length > 0) {
      description += `
# **Setting a topic type**
- This action requires a topic type in order to escalate the user's issue to a human agent. 
- Choose a topic type based on the questions the user has asked. 
- When determining a topic, use the entire conversation history to select a topic, with the last user message given higher importance. 
- If the topic is unclear or isn't exactly one of those options, set the topic to "Unclear Topic"
- You must use a topic from this list:
  ${escalationTopics.map((topic) => `- "${topic}"`).join("\n")}
`;
    }

    // Escalate action
    const result = await client.actions.createOrUpdate({
      actionId: {
        referenceId: ESCALATE_ACTION_ID,
      },
      name: ESCALATE_ACTION_NAME,
      description,
      userInteractionRequired: true,
      userFormParameters: [
        {
          description: `The topic type of the conversation.`,
          id: "topic",
          label: "Escalation Topic",
          required: true,
        },
      ],
      buttonName: "Connect to live agent",
      precondition: {
        preconditionType: "group",
        operator: "AND",
        preconditions: [
          {
            preconditionType: "conversation",
            value: {
              conversationPreconditionType: "metadata",
              key: "escalation_action_enabled",
              value: "true",
            },
          },
          {
            preconditionType: "conversation",
            value: {
              conversationPreconditionType: "metadata",
              key: "handoff_available",
              value: "true",
            },
          },
        ],
      },
    });
  },

  async executeAction({
    actionId,
    settings,
  }: {
    actionId: string;
    settings: AppSettings;
  }) {
    console.log("executeAction", actionId, settings);
    if (actionId === ESCALATE_ACTION_ID) {
      if (settings.handoffConfiguration) {
        try {
          const parsedHandoffConfiguration: HandoffConfiguration = JSON.parse(
            settings.handoffConfiguration,
          );
          if (parsedHandoffConfiguration.type === "salesforce") {
            const salesforceHandoffConfiguration =
              parsedHandoffConfiguration as SalesforceHandoffConfiguration;
            if (salesforceHandoffConfiguration.enableAvailabilityCheck) {
              const url =
                salesforceHandoffConfiguration.chatHostUrl +
                new URLSearchParams({
                  org_id: salesforceHandoffConfiguration.orgId,
                  deployment_id: salesforceHandoffConfiguration.deploymentId,
                  "Availability.ids":
                    salesforceHandoffConfiguration.chatButtonId,
                });
              const response = await fetch(
                `${url}/chat/rest/Visitor/Availability`,
                {
                  method: "GET",
                  headers: {
                    "X-LIVEAGENT-API-VERSION": SALESFORCE_API_VERSION,
                  },
                },
              );
              if (response.ok) {
                const data = await response.json();
                console.log(data);
              } else {
                console.error("Failed to check availability", response);
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse ESCALATION_TOPICS", e);
        }
      }
      return "Escalating to agent...";
    }

    return "unsupported action";
  },
};

export default defaultModule;
