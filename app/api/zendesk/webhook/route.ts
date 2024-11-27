import { type NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  console.log(body);
  return NextResponse.json({ message: 'Hello, world!' });
};
