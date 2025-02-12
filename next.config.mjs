/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: ["chat.onmaven.app", "chat-v2.onmaven.app"],
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async redirects() {
    return [
      {
        source: '/demo/:path*',
        destination: '/preview/:path*',
        permanent: true,
      },
    ];
  },
};

const nextConfigI18n = withNextIntl(nextConfig);

export default nextConfigI18n;
