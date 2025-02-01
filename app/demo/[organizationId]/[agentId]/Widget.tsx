"use client";

type WidgetLoadPayload = {
  envPrefix?: string;
  organizationId: string;
  agentId: string;
  bgColor?: string;
  buttonLabel?: string;
  signedUserData?: string;
  unsignedUserData?: Record<string, any>;
  customData?: Record<string, any>;
};

export default function Widget({
  widgetLoadPayload,
}: {
  widgetLoadPayload: WidgetLoadPayload;
}) {
  const localizedDate = new Date().toLocaleString("en-US", {
    timeZoneName: "long",
  });
  widgetLoadPayload.signedUserData = undefined;
  widgetLoadPayload.unsignedUserData = {
    // ...(widgetLoadPayload.unsignedUserData || {}),
    todaysDate: localizedDate,
  };

  return (
    <>
      <script src="/js/widget.js" defer></script>
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
    addEventListener("load", function () {
      Maven.ChatWidget.load(${JSON.stringify(widgetLoadPayload)});
    });`,
        }}
      ></script>
    </>
  );
}
