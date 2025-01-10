import { describe, it, expect } from "vitest";
import { HandoffStrategyFactory } from "@/lib/handoff/HandoffStrategyFactory";
import { ZendeskStrategy } from "@/lib/handoff/ZendeskStrategy";
import { FrontStrategy } from "@/lib/handoff/FrontStrategy";

describe("HandoffStrategyFactory", () => {
  it("creates a ZendeskStrategy for zendesk type", () => {
    const strategy = HandoffStrategyFactory.createStrategy("zendesk");
    expect(strategy).toBeInstanceOf(ZendeskStrategy);
  });

  it("creates a FrontStrategy for front type", () => {
    const strategy = HandoffStrategyFactory.createStrategy("front");
    expect(strategy).toBeInstanceOf(FrontStrategy);
  });

  it("returns null for null type", () => {
    const strategy = HandoffStrategyFactory.createStrategy(null);
    expect(strategy).toBeNull();
  });
});
