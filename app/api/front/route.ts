import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const headers = request.headers;
  const body = (await request.json()) as {
    type: string;
    payload: {
      channel_id: string;
    };
  };
  if (body.type !== "authorization") {
    return NextResponse.json(
      { type: "bad_request", message: "Unknown type sent to channel" },
      { status: 400 },
    );
  }

  const agentIdentifier = headers.get("authorization")?.split(" ")[1] ?? "";
  const [orgFriendlyId, agentFriendlyId] = agentIdentifier
    .split(" ")
    .map((id) => id.toLowerCase());
  if (!orgFriendlyId || !agentFriendlyId) {
    return NextResponse.json(
      { type: "bad_request", message: "Authorization header is missing" },
      { status: 401 },
    );
  }

  console.log("Received Front application channel installation request", {
    orgId: orgFriendlyId,
    agentId: agentFriendlyId,
  });
  const host =
    process.env.VERCEL_PRODUCTION_URL ??
    process.env.LOCAL_DEV_TUNNEL_URL ??
    "http://localhost:3000";
  const url = new URL(host);
  const hostname = url.hostname;
  const portStr = url.port.length ? `:${url.port}` : "";

  return NextResponse.json(
    {
      type: "success",
      webhook_url: `${url.protocol}//${hostname}${portStr}/api/front/webhook/${orgFriendlyId}/${agentFriendlyId}`,
    },
    { status: 200 },
  );
};
