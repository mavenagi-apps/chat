import { headers } from "next/headers";
import { faker } from "@faker-js/faker";
import { getPublicAppSettings } from "@/app/actions";
import { generateSignedUserData } from "./actions";
import { notFound } from "next/navigation";
import Widget from "./Widget";
import { PreviewHeader } from "@magi/components/preview-header";

// Move faker data generation outside the component
const generateMockUserData = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  id: faker.string.uuid(),
  email: faker.internet.email(),
});

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ organizationId: string; agentId: string }>;
  searchParams: Promise<{
    authenticated?: string;
    customContext?: string;
    customData?: string;
  }>;
}) {
  const authenticated = "authenticated" in (await searchParams);
  const customContext = "customContext" in (await searchParams);
  const { customData: searchParamsCustomData = "{}" } = await searchParams;
  const envPrefix = (await headers()).get("x-magi-env-prefix") ?? "";
  const { organizationId, agentId } = await params;
  const settings = await getPublicAppSettings(organizationId, agentId);
  const brandColor = settings?.branding.brandColor;

  if (!organizationId || !agentId) {
    notFound();
  }

  let signedUserData = null;
  let mockUserData = undefined;

  if (customContext || authenticated) {
    mockUserData = generateMockUserData();
  }

  // Only generate signed user data if authenticated param is present
  if (authenticated) {
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
    parsedCustomData = JSON.parse(decodeURIComponent(searchParamsCustomData));
  } catch (error) {
    console.error("Error parsing customData", error);
  }

  const widgetLoadPayload = {
    envPrefix,
    organizationId,
    agentId,
    bgColor: brandColor || "#00202b",
    signedUserData: signedUserData || undefined,
    unsignedUserData: customContext ? mockUserData : undefined,
    customData: {
      ...parsedCustomData,
    },
  };

  return (
    <div className="flex flex-col h-screen p-6">
      <PreviewHeader badgeText="Chat Preview" showLogo={false} />
      <Widget widgetLoadPayload={widgetLoadPayload} />
    </div>
  );
}
