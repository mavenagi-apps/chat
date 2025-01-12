import type { HandoffStrategy } from "./HandoffStrategy";
import { ZendeskStrategy } from "./ZendeskStrategy";
import { FrontStrategy } from "./FrontStrategy";

export type HandoffType = "zendesk" | "front" | null;

export class HandoffStrategyFactory {
  static createStrategy(type: HandoffType): HandoffStrategy | null {
    switch (type) {
      case "zendesk":
        return new ZendeskStrategy();
      case "front":
        return new FrontStrategy();
      case null:
      default:
        return null;
    }
  }
}
