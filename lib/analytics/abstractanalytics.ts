import { type MagiEvent, type MagiProduct } from "@/lib/analytics/events";

export abstract class AbstractAnalytics {
  protected product: MagiProduct | null;
  protected isInitialized: boolean;

  protected constructor() {
    this.product = null;
    this.isInitialized = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public init(
    product: MagiProduct,
    userId?: string | undefined,
    email?: string | undefined,
  ): AbstractAnalytics {
    console.debug("AbstractAnalytics: init: ", product, userId, email);
    this.product = product;
    this.isInitialized = true;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logEvent(
    eventName: MagiEvent,
    eventData?: Record<string, any> | undefined,
  ): AbstractAnalytics {
    console.debug("AbstractAnalytics: logEvent: ", eventName, eventData);
    return this;
  }

  public setUserId(userId: string): AbstractAnalytics {
    console.debug("AbstractAnalytics: setUserId: ", userId);
    return this;
  }

  public setEmail(email: string): AbstractAnalytics {
    console.debug("AbstractAnalytics: setEmail: ", email);
    return this;
  }
}
