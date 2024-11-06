/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'private-ibex-chat-zendesk.onmaven.app',
        'app.mavenagi.com',
        'zendesk-handoff.onmaven.app',
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: '*',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

const nextConfigI18n = withNextIntl(nextConfig);

export default nextConfigI18n;
