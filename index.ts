import { getMavenAGIClient } from './app';
import {queriesSet} from "@/lib/queries";
import {actionsSet} from "@/lib/actions";

const Chat = {
    async preInstall() {},

    async postInstall({
                          organizationId,
                          agentId,
                      }: {
        organizationId: string;
        agentId: string;
    }) {
        const client = getMavenAGIClient(organizationId, agentId);

        for (const query of queriesSet) {
            await client.actions.createOrUpdate({
                actionId: {
                    referenceId: query.id,
                },
                name: query.id,
                description: query.description,
                userInteractionRequired: false,
                preconditions: { requiredUserContextFieldNames: new Set() },
                userFormParameters: [],
                buttonName: 'Submit',
            });
        }

        for (const action of actionsSet) {
            await client.actions.createOrUpdate({
                actionId: {
                    referenceId: action.id,
                },
                name: action.name,
                description: action.description,
                userInteractionRequired: false,
                preconditions: {requiredUserContextFieldNames: new Set()},
                userFormParameters: action.userFormParameters,
                buttonName: action.buttonName,
            });
        }
    },

    async executeAction({ actionId, parameters }) {
        if (actionId === 'escalate') {
            console.log('Escalating to live chat', parameters);
        }
    }
};

export default Chat;