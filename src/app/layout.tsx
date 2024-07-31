import Spinner from "@/components/Spinner";
import { Toaster } from "@/components/sonner";
import { getMessages } from "@/i18n";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { NextIntlClientProvider } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";

import { MonitoringHeadScript } from "@/components/monitoring";
import "@/app/globals.css";
import Providers from "@/app/providers";
import { TzCookieSetter } from "@/app/tz-cookie-setter";

const font = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Maven AGI",
  description: "Maven AGI",
};

const locales = ["en"];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = "en";
  unstable_setRequestLocale(locale);
  const messages = await getMessages(locale);

  return (
    <UserProvider>
      <html lang={locale}>
        <head>
          <MonitoringHeadScript />
        </head>
        <body className={font.className}>
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone={cookies().get("tz")?.value || "UTC"}
          >
            <Providers cookie={headers().get("cookie") ?? undefined}>
              <Suspense fallback={<Spinner />}>{children}</Suspense>
            </Providers>
          </NextIntlClientProvider>
          <Toaster richColors />
          <TzCookieSetter />
        </body>
      </html>
    </UserProvider>
  );
}
