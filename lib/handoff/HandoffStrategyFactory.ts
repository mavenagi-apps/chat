import type { HandoffStrategy } from "./HandoffStrategy";
import { ZendeskStrategy } from "./ZendeskStrategy";
import { FrontStrategy } from "./FrontStrategy";
import { SalesforceStrategy } from "./SalesforceStrategy";

export type HandoffType = "zendesk" | "front" | "salesforce" | null;

export class HandoffStrategyFactory {
  static createStrategy(type: HandoffType): HandoffStrategy | null {
    switch (type) {
      case "zendesk":
        return new ZendeskStrategy();
      case "front":
        return new FrontStrategy();
      case "salesforce":
        return new SalesforceStrategy();
      case null:
      default:
        return null;
    }
  }
}
