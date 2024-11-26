import { getPublicAppSettings } from "@/app/actions";

type MetadataParams = {
  orgFriendlyId: string;
  id: string;
};

export async function generateSharedMetadata({ params }: { params: Promise<MetadataParams> }) {
  const defaultMetadata = {
    title: 'Support Chat',
    description: 'Powered by Maven AGI',
  };

  const { orgFriendlyId, id: agentId } = await params;
  if (!orgFriendlyId || !agentId) {
    return defaultMetadata;
  }

  const appSettings = await getPublicAppSettings(orgFriendlyId, agentId);

  if (!appSettings) {
    return defaultMetadata;
  }

  const allowlist = appSettings.embedAllowlist || [];
  if (
    ['true', '1'].includes(appSettings.enableDemoSite || '')
  ) {
    allowlist.push('self');
  }

  return {
    ...defaultMetadata,
    other: {
      'Content-Security-Policy':
        allowlist.length > 0
          ? `frame-ancestors ${allowlist.join(' ')};`
          : "frame-ancestors 'none';",
    },
  };
} 