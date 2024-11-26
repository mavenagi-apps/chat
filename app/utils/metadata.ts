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

  const awaitedParams = await params;

  console.log('params', awaitedParams);
  console.log('orgFriendlyId', orgFriendlyId);
  console.log('agentId', agentId);

  if (!orgFriendlyId || !agentId) {
    return defaultMetadata;
  }

  const appSettings = await getPublicAppSettings(orgFriendlyId, agentId);

  if (!appSettings) {
    return defaultMetadata;
  }

  const allowlist = appSettings.embedAllowlist || [];
  if (
    process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    ['true', '1'].includes(appSettings.enableDemoSite || '')
  ) {
    allowlist.push(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  console.log('allowlist', allowlist);

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