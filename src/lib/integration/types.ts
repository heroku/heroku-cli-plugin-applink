/**
 * An connection between a Heroku app and an integration platform.
 */
export type Connection = {
  /** connection ID */
  readonly id?: string
  /** Salesforce Org info */
  readonly salesforce_org: {
    readonly id?: string | null
    readonly instance_url?: string | null
    readonly org_name: string
    readonly run_as_user?: string | null
  }
  /** redirect URI for authentication */
  readonly redirect_uri?: string | null
  /** connection state */
  readonly state:
    'pending' | 'authenticating' | 'authenticated' | 'authentication_failed' |
    'connecting' | 'connected' | 'connection_failed' | 'disconnecting' | 'disconnected'
  /** connection type */
  readonly 'type': 'DatacloudOrg' | 'SalesforceOrg'
}

/**
 * An app import process.
 */
export type AppImport = {
  /** client name */
  readonly client_name: string
  /** generate authorization permission set */
  readonly generate_authorization_permission_set: boolean
  /** app import ID */
  readonly id: string
  /** Salesforce Org info */
  readonly salesforce_org: {
    readonly id?: string | null
    readonly instance_url?: string | null
    readonly org_name: string
    readonly run_as_user?: string | null
  }
  /** import process state */
  readonly state: 'pending' | 'importing' | 'imported' | 'import_failed'
}
