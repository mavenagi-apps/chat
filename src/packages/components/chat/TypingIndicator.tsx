import { useTranslations } from "next-intl";
import Animation from "@magi/components/Animation";
import typingIndicatorJson from "@magi/components/chat/typing-indicator.json";

export function TypingIndicator() {
  const t = useTranslations("chat.ChatPage");
  return (
    <div className="my-5 flex items-center h-auto">
      <div className="shrink-0 p-0 m-0">
        <Animation
          animationData={typingIndicatorJson}
          alignLeft={true}
          height={"24px"}
          width={"40px"}
        />
      </div>
      <span className="ml-2">{t("agent_typing")}</span>
    </div>
  );
}
