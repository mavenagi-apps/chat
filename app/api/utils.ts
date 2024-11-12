import { getMavenAGIClient } from '@/app';

export async function getAppSettings(
  orgFriendlyId: string,
  agentId: string
): Promise<AppSettings> {
  const client = getMavenAGIClient(orgFriendlyId, agentId);
  return await client.appSettings.get() as unknown as AppSettings;
}

