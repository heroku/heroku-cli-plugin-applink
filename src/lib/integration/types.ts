/**
 * A connection between a Heroku app and a Salesforce Org.
 */
export type SalesforceConnection = {
  /** last error on connection */
  readonly error?: {
    id: string
    message: string
  }
  /** connection ID */
  readonly id: string
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
  readonly 'type': 'SalesforceOrg'
}

/**
 * A connection between a Heroku app and a Datacloud Org.
 */
export type DatacloudConnection = {
  /** last error on connection */
  readonly error?: {
    id: string
    message: string
  }
  /** connection ID */
  readonly id: string
  /** Datacloud Org info */
  readonly datacloud_org: {
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
  readonly 'type': 'DatacloudOrg'
}

export type Connection = SalesforceConnection | DatacloudConnection

export function isSalesforceConnection(connection: Connection): connection is SalesforceConnection {
  return (connection as SalesforceConnection).salesforce_org !== undefined
}

export function isDatacloudConnection(connection: Connection): connection is DatacloudConnection {
  return !isSalesforceConnection(connection)
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
  /** app info */
  readonly heroku_app: {
    id: string
    name: string
    url: string
  }
  /** last error on import */
  readonly error?: {
    id: string
    message: string
  }
}

/**
 * App import request body
 */
export type AppImportRequestBody = {
  readonly client_name: string
  readonly api_spec: string
  readonly generate_authorization_permission_set: boolean
  readonly hex_digest: string
}
