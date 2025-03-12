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

export type InitializeHandoffParams = {
  email?: string;
  customFieldValues?: Record<string, string | boolean | number>;
};

export type HandoffHookReturn = {
  initializeHandoff: (params: InitializeHandoffParams) => Promise<void>;
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

// Define the custom field types
type CustomFieldType = "STRING" | "BOOLEAN" | "NUMBER";

// Define the enum option structure
type EnumOption = {
  label: string; // User-facing string in dropdown/radio
  value: any; // Actual value to be stored (can be any type)
};

// Define the custom field structure
export type CustomField = {
  id: number; // Unique identifier for the field
  label: string; // User-facing label for the field
  description: string; // Longer description shown near the label
  required: boolean; // Whether field is required
  type?: CustomFieldType; // Parameter type (defaults to STRING)
  enumOptions?: EnumOption[]; // Options for dropdown fields
};
