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
  const [organizationId, agentId] = agentIdentifier
    .split("-")
    .map((id) => id.toLowerCase());
  if (!organizationId || !agentId) {
    return NextResponse.json(
      { type: "bad_request", message: "Authorization header is missing" },
      { status: 401 },
    );
  }

  console.log("Received Front application channel installation request", {
    orgId: organizationId,
    agentId: agentId,
  });
  const host =
    (process.env.VERCEL_PROJECT_PRODUCTION_URL?.length
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ??
    process.env.LOCAL_DEV_TUNNEL_URL ??
    "http://localhost:3000";
  const url = new URL(host);
  const hostname = url.hostname;
  const portStr = url.port.length ? `:${url.port}` : "";

  return NextResponse.json(
    {
      type: "success",
      webhook_url: `${url.protocol}//${hostname}${portStr}/api/front/webhook/${organizationId}/${agentId}`,
    },
    { status: 200 },
  );
};
