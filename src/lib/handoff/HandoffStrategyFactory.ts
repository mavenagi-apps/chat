import type { HandoffStrategy } from "./HandoffStrategy";
import { ZendeskStrategy } from "./ZendeskStrategy";
import { FrontStrategy } from "./FrontStrategy";
import { SalesforceStrategy } from "./SalesforceStrategy";

export type HandoffType = "zendesk" | "front" | "salesforce" | null | undefined;

export class HandoffStrategyFactory {
  static createStrategy(
    type: HandoffType,
    configuration?: ClientSafeHandoffConfig,
  ): HandoffStrategy<Record<string, any>> | null {
    switch (type) {
      case "zendesk":
        return new ZendeskStrategy(configuration as ClientSafeHandoffConfig);
      case "front":
        return new FrontStrategy(configuration as ClientSafeHandoffConfig);
      case "salesforce":
        return new SalesforceStrategy(configuration as ClientSafeHandoffConfig);
      case null:
      case undefined:
      default:
        return null;
    }
  }
}
