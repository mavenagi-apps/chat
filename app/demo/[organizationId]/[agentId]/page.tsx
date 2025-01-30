"use client";

import { headers } from "next/headers";
import { faker } from "@faker-js/faker";
import { getPublicAppSettings } from "@/app/actions";
import { generateSignedUserData } from "./actions";
import { notFound } from "next/navigation";
import backgroundImg from "@/assets/background/bg.jpg";

// Move faker data generation outside the component
const mockUserData = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  id: faker.string.uuid(),
  email: faker.internet.email(),
  todaysDate: new Date().toLocaleString(),
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ organizationId: string; agentId: string }>;
  searchParams: Promise<{ anonymous?: string; customData?: string }>;
}) {
  const anonymous = "anonymous" in (await searchParams);
  const { customData: searchParamsCustomData = "{}" } = await searchParams;
  const envPrefix = (await headers()).get("x-magi-env-prefix") ?? "";
  const { organizationId, agentId } = await params;
  const settings = await getPublicAppSettings(organizationId, agentId);
  const brandColor = settings?.brandColor;

  if (!organizationId || !agentId) {
    notFound();
  }

  let signedUserData = null;

  // Only generate signed user data if anonymous param is not present
  if (!anonymous) {
    try {
      signedUserData = await generateSignedUserData(
        mockUserData,
        organizationId,
        agentId,
      );
    } catch (error) {
      console.error("Error generating signed user data", error);
    }
  }

  let parsedCustomData = {};

  try {
    parsedCustomData = JSON.parse(searchParamsCustomData);
  } catch (error) {
    console.error("Error parsing customData", error);
  }

  const widgetLoadPayload = {
    envPrefix,
    organizationId,
    agentId,
    bgColor: brandColor || "#00202b",
    signedUserData: signedUserData || undefined,
    unsignedUserData: mockUserData,
    customData: {
      ...parsedCustomData,
    },
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImg.src})`,
        backgroundSize: "cover",
        height: "100vh",
      }}
    >
      <script src="/js/widget.js" defer></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
    addEventListener("load", function () {
      Maven.ChatWidget.load(${JSON.stringify(widgetLoadPayload)});
    });`,
        }}
      ></script>
    </div>
  );
}
