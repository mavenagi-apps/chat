/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const nextConfig = {};

const nextConfigI18n = withNextIntl(nextConfig)

export default nextConfigI18n;
