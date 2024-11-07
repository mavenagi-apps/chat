'use client'

import {type MagiEvent, type MagiProduct} from '@/lib/analytics/events'
import * as amplitude from '@amplitude/analytics-browser'
import {type BrowserConfig, type EnrichmentPlugin, type Event} from '@amplitude/analytics-types'

import {AbstractAnalytics} from './abstractanalytics'

class FilterEventsPlugin implements EnrichmentPlugin {
  name = 'filter-events-plugin'
  product: MagiProduct
  // type = PluginType.ENRICHMENT as any

  constructor(product: MagiProduct) {
    this.product = product
  }

  public setProduct(product: MagiProduct): void {
    this.product = product
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setup(_config: BrowserConfig): Promise<void> {
    return undefined
  }

  async execute(event: Event): Promise<Event | null> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (event.event_properties) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.event_properties['magi_product'] = this.product
    }
    // Allow other events to be processed and sent to destination plugins
    return event
  }
}

export class AmplitudeAnalytics extends AbstractAnalytics {
  filterEventsPlugin: FilterEventsPlugin | null;
  amplitudeApiKey: string;

  constructor(amplitudeApiKey: string) {
    super();
    this.filterEventsPlugin = null;
    this.amplitudeApiKey = amplitudeApiKey;
  }

  // Amplitude setup
  public override init(
    product: MagiProduct,
    userId?: string | undefined,
    email?: string | undefined
  ): AbstractAnalytics {
    if (!this.isInitialized) {
      super.init(product, userId);
      typeof window !== 'undefined' &&
        amplitude.init(this.amplitudeApiKey!, userId, {
          logLevel: amplitude.Types.LogLevel.Warn,
          defaultTracking: {
            attribution: true,
            fileDownloads: true,
            formInteractions: true,
            pageViews: true,
            sessions: true,
          },
          identityStorage: 'localStorage',
          userId: userId,
        });
      this.filterEventsPlugin = new FilterEventsPlugin(product);
      typeof window !== 'undefined' && amplitude.add(this.filterEventsPlugin);
    } else {
      console.debug('AmplitudeAnalytics: init: already initialized');
      console.debug('Setting product to: ', product);
      this.product = product;
      this.filterEventsPlugin?.setProduct(product);
      typeof userId !== 'undefined' && this.setUserId(userId);
    }
    email && this.setEmail(email);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override logEvent(
    eventName: MagiEvent,
    eventData?: Record<string, any> | undefined
  ): AmplitudeAnalytics {
    super.logEvent(eventName, eventData);
    typeof window !== 'undefined' && amplitude.logEvent(eventName, eventData);
    return this;
  }

  public override setUserId(userId: string): AbstractAnalytics {
    super.setUserId(userId);
    typeof window !== 'undefined' && amplitude.setUserId(userId);
    return this;
  }
  public override setEmail(email: string): AbstractAnalytics {
    super.setEmail(email);
    typeof window !== 'undefined' &&
      amplitude.identify(new amplitude.Identify().set('email', email));
    return this;
  }
}
