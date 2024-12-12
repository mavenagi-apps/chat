import { jsonFetch } from "@/lib/jsonFetch";

export type AgentOrganizationResponse = {
  id: string;
  name: string;
  friendlyId: string;
  defaultAgentId: string;
  defaultLanguage: string;
};

export type AgentResponse = {
  id: string;
  name: string;
  organizationId: string;
  friendlyId: string;
  enabled: boolean;
};

export type AgentSelfIdResponse = {
  id: string;
  enabled: boolean;
};

export class MavenAPIClient {
  private host = "https://app.mavenagi.com";
  constructor(private agentAPIKey: string) {}

  public async agentSelfId() {
    const url = new URL("/api/v1/agents/self/id/", this.host);
    return await jsonFetch<AgentSelfIdResponse>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.agentAPIKey}`,
      },
    });
  }

  public async agent(id: string) {
    const url = new URL(`/api/v1/agents/${id}`, this.host);
    return await jsonFetch<AgentResponse>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.agentAPIKey}`,
      },
    });
  }

  public async agentOrganization(id: string) {
    const url = new URL(`/api/v1/agents/${id}/organization`, this.host);

    return await jsonFetch<AgentOrganizationResponse>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.agentAPIKey}`,
      },
    });
  }
}
