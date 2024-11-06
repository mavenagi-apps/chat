import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import { getMessages } from '@/i18n'
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: "Support Chat",
  description: "Powered by Maven AGI",
};

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = 'en'
  unstable_setRequestLocale(locale)
  const messages = await getMessages(locale)

  return (
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone={'UTC'}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </NextIntlClientProvider>
  );
}