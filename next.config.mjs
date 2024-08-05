import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const isProd =
  process.env.ENVIRONMENT === "production" ||
  process.env.ENVIRONMENT === "prod";
const isStaging = process.env.ENVIRONMENT === "staging";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    return config;
  },
  output: "standalone",
  assetPrefix: isProd
    ? "https://www.mavenagi-static.com"
    : isStaging
      ? "https://www.staging.mavenagi-static.com"
      : undefined,
  transpilePackages: [
    // "@magi/data",
    // "@magi/fetcher",
    // "@magi/ui",
    "tailwindconfig",
  ],
  experimental: {
    optimizePackageImports: ["@magi/ui"],
    instrumentationHook: true,
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  poweredByHeader: false,
};

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfigI18n = withNextIntl(nextConfig);

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  debug: process.env.NODE_ENV === "development",

  // Additional config options for the Sentry webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, configFile, stripPrefix, urlPrefix, include, ignore

  org: "mavenagi",
  project: "app-ui",

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true, // Suppresses all logs

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

export default withSentryConfig(nextConfigI18n, sentryWebpackPluginOptions);
