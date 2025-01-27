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
      buttonId: "123",
      ...parsedCustomData,
    },
  };

  // TA
  // const chatSettings = {
  //   organizationId: "00DVA0000037MYL",
  //   buttonId: "5735d000000blix",
  //   deploymentId: "5725d000000blNa",
  // }

  // TIVO
  const chatSettings = {
    organizationId: "00D0U0000009Hbl",
    buttonId: "573O9000001AyGr",
    deploymentId: "572O90000054FIX",
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImg.src})`,
        backgroundSize: "cover",
        height: "100vh",
      }}
    >
      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `

      <script type='text/javascript' src='https://c.la12s-core1.sfdc-lywfpd.salesforceliveagent.com/content/g/js/63.0/deployment.js'></script>
<script type='text/javascript'>
liveagent.init('https://d.la12s-core1.sfdc-lywfpd.salesforceliveagent.com/chat', '${chatSettings.deploymentId}', '${chatSettings.organizationId}');
</script>
      
      
      <a
      id="liveagent_button_online_${chatSettings.buttonId}"
      href="javascript://Chat"
      style="display: none;"
      onclick="liveagent.startChat('${chatSettings.buttonId}')"
      >ONLINE<!-- Online Chat Content -->
      </a>
      <div id="liveagent_button_offline_${chatSettings.buttonId}" style="display: none;">OFFLINE<!-- Offline Chat Content --></div><script type="text/javascript">




if (!window._laq) { window._laq = []; }
window._laq.push(function(){liveagent.showWhenOnline('${chatSettings.buttonId}', document.getElementById('liveagent_button_online_${chatSettings.buttonId}'));
liveagent.showWhenOffline('${chatSettings.buttonId}', document.getElementById('liveagent_button_offline_${chatSettings.buttonId}'));
});</script>

`,
        }}
      />
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
