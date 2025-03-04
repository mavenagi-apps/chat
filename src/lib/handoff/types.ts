import type {
  Message,
  UserChatMessage,
  IncomingHandoffEvent,
  IncomingHandoffConnectionEvent,
} from "@/src/types";
import type { HandoffStatus } from "@/src/app/constants/handoff";

export type HandoffProps = {
  messages: Message[];
  mavenConversationId: string;
};

export type Params = {
  organizationId: string;
  agentId: string;
};

export type HandoffState = {
  handoffError: string | null;
  handoffChatEvents: (
    | UserChatMessage
    | IncomingHandoffEvent
    | IncomingHandoffConnectionEvent
  )[];
  isConnected: boolean;
  handoffAuthToken: string | null;
  agentName: string | null;
  handoffStatus: HandoffStatus;
};

export type HandoffHookReturn = {
  initializeHandoff: (params: { email?: string }) => Promise<void>;
  handoffStatus: HandoffStatus;
  handoffError: string | null;
  handoffChatEvents: HandoffState["handoffChatEvents"];
  agentName: string | null;
  askHandoff: (message: string) => Promise<void>;
  handleEndHandoff: () => Promise<void>;
  isConnected: boolean;
  showTypingIndicator: boolean;
  shouldSupressHandoffInputDisplay: boolean;
};
