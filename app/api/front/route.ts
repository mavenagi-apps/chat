import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { MavenAPIClient } from "../server/lib/maven";
import type { JsonFetchError } from "@/lib/jsonFetch";

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

  const agentAPIKey = headers.get("authorization")?.split(" ")[1];
  if (!agentAPIKey) {
    return NextResponse.json(
      { type: "bad_request", message: "Authorization header is missing" },
      { status: 401 },
    );
  }
  const mavenAPIClient = new MavenAPIClient(agentAPIKey);
  let agentId: string;
  let orgFriendlyId: string;
  let agentFriendlyId: string;
  try {
    const agent = await mavenAPIClient.agentSelfId();
    agentId = agent.id;
    if (!agent.enabled) {
      return NextResponse.json(
        { type: "bad_request", message: "Agent is not enabled" },
        { status: 400 },
      );
    }
    [{ friendlyId: orgFriendlyId }, { friendlyId: agentFriendlyId }] =
      await Promise.all([
        mavenAPIClient.agentOrganization(agentId),
        mavenAPIClient.agent(agentId),
      ]);
  } catch (error) {
    console.error("Error getting agent", error);
    return NextResponse.json(
      { type: "bad_request", message: "API Token validation failed" },
      { status: (error as JsonFetchError).response?.status ?? 400 },
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
