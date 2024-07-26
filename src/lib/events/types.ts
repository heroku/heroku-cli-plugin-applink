/**
 * Authorization "extra" attributes expected for the "salesforce" platform on create.
 */
export type SalesforceAuthExtra = {
  /** OAuth flow redirection URI */
  readonly redirect_uri: string
}

/**
 * Authorization "params" expected for the "salesforce" platform.
 */
export type SalesforceAuthParams = {
  /** Salesforce Org instance name */
  readonly org_name: string
  /** authorizer URL */
  readonly url?: null | string
}

// Currently, we only support Salesforce Platform authorizations.
// In the future we may add more platforms, and we'll be adding new 'extra' and 'params' types
// for each platform.

/**
 * An authorization represents a connection between a Heroku app and a platform where events
 * can be subscribed or published.
 */
export type Authorization = {
  /** additional attributes */
  readonly extra?: SalesforceAuthExtra
  /** unique identifier of an authorization */
  readonly id: string
  /** exposed authorization params */
  readonly params: SalesforceAuthParams
  /** authorizer platform name */
  readonly platform: 'salesforce'
}

/**
 * Subscription "params" expected for the "generate" platform.
 */
export type GenerateSubscriptionParams = {
  /** how often to trigger the event */
  readonly interval: string
  /** the payload to be generated */
  readonly mapping: string
}

/**
 * Subscription "params" expected for the "salesforce" platform.
 */
export type SalesforceSubscriptionParams = {
  /** subscribed event */
  readonly event: string
  /** Salesforce Org instance name */
  readonly org_name: string
}

/**
 * A subscription to a source of events.
 */
export type Subscription = {
  /** unique identifier of a subscription */
  readonly id: string
  /** subscription name */
  readonly name: string
  /** exposed subscription params */
  readonly params: GenerateSubscriptionParams | SalesforceSubscriptionParams
  /** event source platform */
  readonly platform: 'generate' | 'salesforce'
  /** array of publications linked to this subscription */
  readonly targets: Array<Omit<Publication, 'sources'>>
}

/**
 * Publication "params" expected for the "datacloud" platform.
 */
export type DatacloudPublicationParams = {
  /** ingest API Data Connector name */
  readonly connector: string
  /** object to publish to */
  readonly object: string
  /** authorizer instance name */
  readonly org_name: string
}

/**
 * Publication "params" expected for the "datacloud" platform.
 */
export type SalesforcePublicationParams = {
  /** event to publish to */
  readonly event: string
  /** Salesforce Org instance name */
  readonly org_name: string
}

export type WebhookPublicationParams = {
  /** webhook URL */
  readonly url: string
}

/**
 * A publication to a target of events.
 */
export type Publication = {
  /** unique identifier of a publication */
  readonly id: string
  /** publication name to be created */
  readonly name: string
  /** event publication params */
  readonly params: DatacloudPublicationParams
    | SalesforcePublicationParams
    | WebhookPublicationParams
  /** event publication platform */
  readonly platform: 'datacloud' | 'salesforce' | 'webhook'
  /** array of subscriptions linked to this publication */
  readonly sources: Array<Omit<Subscription, 'targets'>>
}
