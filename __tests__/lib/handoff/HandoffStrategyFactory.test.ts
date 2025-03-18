import { describe, it, expect } from "vitest";
import { HandoffStrategyFactory } from "@/src/lib/handoff/HandoffStrategyFactory";
import { ZendeskStrategy } from "@/src/lib/handoff/ZendeskStrategy";
import { FrontStrategy } from "@/src/lib/handoff/FrontStrategy";
import { SalesforceStrategy } from "@/src/lib/handoff/SalesforceStrategy";
import { SalesforceMessagingStrategy } from "@/src/lib/handoff/SalesforceMessagingStrategy";

describe("HandoffStrategyFactory", () => {
  const salesforceConfig = {
    type: "salesforce" as const,
    orgId: "test-org",
    chatHostUrl: "test-url",
    chatButtonId: "test-button",
    deploymentId: "test-deployment",
    eswLiveAgentDevName: "test-name",
    apiSecret: "test-secret",
    handoffTerminatingMessageText: "goodbye",
  } as ClientSafeHandoffConfig;

  const zendeskConfig = {
    type: "zendesk" as const,
  } as ClientSafeHandoffConfig;

  const frontConfig = {
    type: "front" as const,
  } as ClientSafeHandoffConfig;

  const salesforceMessagingConfig = {
    type: "salesforce-messaging" as const,
  } as ClientSafeHandoffConfig;

  it("creates a ZendeskStrategy for zendesk type", () => {
    const strategy = HandoffStrategyFactory.createStrategy("zendesk");
    expect(strategy).toBeInstanceOf(ZendeskStrategy);
  });

  it("creates a FrontStrategy for front type", () => {
    const strategy = HandoffStrategyFactory.createStrategy("front");
    expect(strategy).toBeInstanceOf(FrontStrategy);
  });

  it("creates a SalesforceStrategy for salesforce type", () => {
    const strategy = HandoffStrategyFactory.createStrategy("salesforce");
    expect(strategy).toBeInstanceOf(SalesforceStrategy);
  });

  it("creates a SalesforceMessagingStrategy for salesforce-messaging type", () => {
    const strategy = HandoffStrategyFactory.createStrategy(
      "salesforce-messaging",
    );
    expect(strategy).toBeInstanceOf(SalesforceMessagingStrategy);
  });

  it("creates a ZendeskStrategy with configuration", () => {
    const strategy = HandoffStrategyFactory.createStrategy(
      "zendesk",
      zendeskConfig,
    );
    expect(strategy).toBeInstanceOf(ZendeskStrategy);
  });

  it("creates a FrontStrategy with configuration", () => {
    const strategy = HandoffStrategyFactory.createStrategy(
      "front",
      frontConfig,
    );
    expect(strategy).toBeInstanceOf(FrontStrategy);
  });

  it("creates a SalesforceStrategy with configuration", () => {
    const strategy = HandoffStrategyFactory.createStrategy(
      "salesforce",
      salesforceConfig,
    );
    expect(strategy).toBeInstanceOf(SalesforceStrategy);
  });

  it("creates a SalesforceMessagingStrategy with configuration", () => {
    const strategy = HandoffStrategyFactory.createStrategy(
      "salesforce-messaging",
      salesforceMessagingConfig,
    );
    expect(strategy).toBeInstanceOf(SalesforceMessagingStrategy);
  });

  it("returns null for null type", () => {
    const strategy = HandoffStrategyFactory.createStrategy(null);
    expect(strategy).toBeNull();
  });
});
