import type { Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl'
import {unstable_setRequestLocale} from 'next-intl/server'
import {getMessages} from '@/i18n'

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

// export default async function ChatLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const locale = 'en'
//   unstable_setRequestLocale(locale)
//   const messages = await getMessages(locale)

//   console.log(messages)

//   return (
//     <NextIntlClientProvider locale={locale} messages={messages} timeZone={'UTC'}>
//       {children}
//     </NextIntlClientProvider>
//   );
// }

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = 'en'
  unstable_setRequestLocale(locale)
  const messages = await getMessages(locale)
  // const messages = {}

  // console.log(messages)

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={'UTC'}>
      <div>{children}</div>
    </NextIntlClientProvider>
  );
}