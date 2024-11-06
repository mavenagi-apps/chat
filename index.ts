import { getMavenAGIClient } from './app';

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
    const client = getMavenAGIClient(organizationId, agentId);
    const escalationTopics: string[] = [];

    try {
      escalationTopics.push(...JSON.parse(settings.escalationTopics || '[]'));
    } catch (e) {
      console.error('Failed to parse ESCALATION_TOPICS', e);
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
  ${escalationTopics.map((topic) => `- "${topic}"`).join('\n')}
`;
    }

    // Escalate action
    const result = await client.actions.createOrUpdate({
      actionId: {
        referenceId: 'escalate-to-zendesk',
      },
      name: 'Escalate to a Zendesk support agent',
      description,
      userInteractionRequired: true,
      userFormParameters: [
        {
          description: `The topic type of the conversation.`,
          id: 'topic',
          label: 'Escalation Topic',
          required: true,
        },
      ],
      buttonName: 'Submit',
      precondition: {
        preconditionType: 'conversation',
        value: {
          conversationPreconditionType: 'metadata',
          key: 'escalation_action_enabled',
          value: 'true',
        },
      },
    });

    console.log("Escalate action created", result);
  },

  async executeAction({
    actionId,
    parameters,
  }: {
    actionId: string;
    parameters: Record<string, any>;
  }) {
    if (actionId === 'escalate-to-zendesk') {
      console.log('Escalating to Zendesk with topic:', parameters);
      return 'Escalation is coming soon! No human agents currently available.';
    }

    return 'unsupported action';
  },
};

export default defaultModule;
