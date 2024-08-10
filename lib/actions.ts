const escalationTopics = [
    'Managing your business listing',
    'Growing your business',
    'Managing reviews & responses',
    'Managing your reviews and photos',
    'Rentals Owner support',
    'Things to do Operator support',
    'The Fork Manager support',
    'Tripadvisor Best Practices',
    'Trust and Safety',
    'Unclear Topic',
];


export const actionsSet = [
    {
        id: 'escalate',
        name: 'Escalate to a human support agent',
        description: `Escalate to a human support agent\nThis action requires a topic type in order to escalate the users issue to a human agent. Please figure out the topic from the type of questions the user has asked. Must be one of: "${escalationTopics.join(
            '", "')}". If the topic is unclear or isn't exactly one of those options, set the topic to "Unclear Topic"`,
        userFormParameters: [
            {
                description: `The topic type of the conversation.`,
                id: 'topic',
                label: 'Escalation Topic',
                required: true,
            },
        ],
        buttonName: 'Submit',
    }
]
