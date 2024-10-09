import { getMavenAGIClient } from './app';
import {escalationTopics} from "@/lib/actions";

const defaultModule = {

  async postInstall({
                      organizationId,
                      agentId,
                    }: {
    organizationId: string;
    agentId: string;
  }) {
    const client = getMavenAGIClient(organizationId, agentId);

    // Escalate action
    const result = await client.actions.createOrUpdate({
      actionId: {
        referenceId: 'escalate',
      },
      name: 'Escalate to a human support agent',
      description: `This action escalates the conversation to a human support agent via live chat. This will show a button to the user which the user must click to be connected to live chat.

# **Response Instructions for \`escalate\`**
- Always acknowledge the member's question or concern and inform them you will connect them to support when using this action. Include the following text at the end of your reply: "Click the button below to be connected to an agent."

# **Setting a topic type**
- This action requires a topic type in order to escalate the user's issue to a human agent. 
- Choose a topic type based on the questions the user has asked. 
- When determining a category, use the entire conversation history to select a topic, with the last user message given higher importance. 
- If the topic is unclear or isn't exactly one of those options, set the topic to "Unclear Topic"
- You must use a category from this list:
    ${escalationTopics.map(topic => `- "${topic}"`).join('\n')}
      `,
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
    console.log('GOT EXECUTE ACTION:', actionId, parameters);


    // TODO: Add Salesforce escalation logic here
    if (actionId === 'escalate') {
      console.log('Got an escalation request for ' + parameters.topic);

      return 'Escalation is coming soon! No human agents currently available.';
    }

    return 'unsupported action';
  },
};

export default defaultModule;
