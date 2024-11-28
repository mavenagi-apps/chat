import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import redisClient from '@/app/api/server/lib/redis';

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  console.log(JSON.stringify(body, null, 2));
  for (const event of body.events) {
    if (!event.type.startsWith('conversation.')) {
      continue;
    }

    const conversationId = event.payload?.conversation?.id;
    const eventId = event.id;

    if (!conversationId || !eventId) {
      continue;
    }

    await redisClient.setEx(
      `zendesk:${conversationId}:${eventId}`,
      60, // 1 minute
      JSON.stringify(event)
    );

    // Verify the key was set
    const savedValue = await redisClient.get(
      `zendesk:${conversationId}:${eventId}`
    );
    console.log('Saved value:', savedValue);

    if (!savedValue) {
      console.error(`Failed to save event for conversation ${conversationId}`);
    }
  }

  return NextResponse.json({ success: true });
};
