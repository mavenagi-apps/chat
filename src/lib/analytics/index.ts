import {AbstractAnalytics} from './abstractanalytics'
import {AmplitudeAnalytics} from './amplitude'
import {type MagiEvent, type MagiProduct} from './events'

export class Analytics extends AbstractAnalytics {
  static _instance: Analytics
  _providers: AbstractAnalytics[]

  constructor() {
    super()
    this._providers = [new AmplitudeAnalytics()]
  }

  public init(product: MagiProduct, userId?: string | undefined, email?: string | undefined): AbstractAnalytics {
    this._providers.map(p => p.init(product, userId, email))
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override logEvent(eventName: MagiEvent, eventData?: Record<string, any> | undefined): AbstractAnalytics {
    this._providers.map(p => p.logEvent(eventName, eventData))
    return this
  }

  public override setUserId(userId: string): AbstractAnalytics {
    this._providers.map(p => p.setUserId(userId))
    return this
  }

  public override setEmail(email: string): AbstractAnalytics {
    this._providers.map(p => p.setUserId(email))
    return this
  }

  static getInstance() {
    if (!Analytics._instance) {
      Analytics._instance = new Analytics()
    }
    return Analytics._instance
  }
}
