import { FrontServerStrategy } from "./FrontServerStrategy";
import type { ServerHandoffStrategy } from "./HandoffStrategy";
import type { HandoffType } from "./HandoffStrategyFactory";
import { SalesforceServerStrategy } from "./SalesforceStrategy";
import { ZendeskServerStrategy } from "./ZendeskStrategy";

export class ServerHandoffStrategyFactory {
  static createStrategy(
    type: HandoffType,
    configuration: HandoffConfiguration,
  ): ServerHandoffStrategy | null {
    switch (type) {
      case "zendesk":
        return new ZendeskServerStrategy(
          configuration as ZendeskHandoffConfiguration,
        );
      case "front":
        return new FrontServerStrategy(
          configuration as FrontHandoffConfiguration,
        );
      case "salesforce":
        return new SalesforceServerStrategy(
          configuration as SalesforceHandoffConfiguration,
        );
      case null:
      case undefined:
      default:
        return null;
    }
  }
}
