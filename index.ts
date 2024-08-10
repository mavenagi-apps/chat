import { getMavenAGIClient } from './app';
import { escalationTopics } from "@/lib/actions";

const Chat = {

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
            description: `Escalate to a human support agent\nThis action requires a topic type in order to escalate the users issue to a human agent. Please figure out the topic from the type of questions the user has asked. Must be one of: "${escalationTopics.join(
                '", "'
            )}". If the topic is unclear or isn't exactly one of those options, set the topic to "Unclear Topic"`,
            userInteractionRequired: false,
            preconditions: { requiredUserContextFieldNames: new Set() },
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


};

export default Chat;