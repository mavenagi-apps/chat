import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import ClientLayout from "./ClientLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Chat",
  description: "Powered by Maven AGI",
};

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ClientLayout>{children}</ClientLayout>
    </NextIntlClientProvider>
  );
}
