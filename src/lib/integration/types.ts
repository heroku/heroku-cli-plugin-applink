/**
 * An connection between a Heroku app and an integration platform.
 */
export type Connection = {
  /** unique identifier of a connection */
  readonly id: string
  /** org info */
  readonly org: {
    readonly id: string
    readonly alias: string
    readonly instance_url: string
  }
  /** run as user */
  readonly run_as_user: string
  /** connection state */
  readonly state: 'connecting' | 'connected' | 'connection_failed'
  /** integration type */
  readonly type: 'datacloud' | 'salesforce'
}
