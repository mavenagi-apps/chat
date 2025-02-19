import type { HandoffStrategy } from "./HandoffStrategy";
import { ZendeskStrategy } from "./ZendeskStrategy";
import { FrontStrategy } from "./FrontStrategy";
import { SalesforceStrategy } from "./SalesforceStrategy";

export type HandoffType = "zendesk" | "front" | "salesforce" | null | undefined;

export class HandoffStrategyFactory {
  static createStrategy(
    type: HandoffType,
    configuration?: HandoffConfiguration,
  ): HandoffStrategy<Record<string, any>> | null {
    switch (type) {
      case "zendesk":
        return new ZendeskStrategy(
          configuration as ZendeskHandoffConfiguration,
        );
      case "front":
        return new FrontStrategy(configuration as FrontHandoffConfiguration);
      case "salesforce":
        return new SalesforceStrategy(
          configuration as SalesforceHandoffConfiguration,
        );
      case null:
      case undefined:
      default:
        return null;
    }
  }
}
