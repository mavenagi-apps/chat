import { MavenAGIClient } from 'mavenagi';

export function getMavenAGIClient(organizationId: string, agentId: string) {
  return new MavenAGIClient({
    organizationId,
    agentId,
  });
}