export const queriesSet = [
    {
        id: 'revenue',
        description: "Balance: provides the user's revenue information",
        example: {
            sales: {
                data: {
                    fees: '$500.00',
                    gross: '$3000.00',
                    net: '$2500.00',
                },
                entity_type: 'revenue',
                respond_with_disclaimer: false,
                timestamp: null,
            },
        },
    }
]
