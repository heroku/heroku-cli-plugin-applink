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
    'connecting' | 'connected' | 'connection_failed' |
    'disconnecting' | 'disconnected' | 'disconnection_failed'
  /** connection type */
  readonly 'type': 'SalesforceOrg'
}

/**
 * A connection between a Data Cloud Org and Heroku app.
 */
export type DataCloudConnection = {
  /** last error on connection */
  readonly error?: {
    id: string
    message: string
  }
  /** connection ID */
  readonly id: string
  /** Data Cloud Org info */
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
    'connecting' | 'connected' | 'connection_failed' |
    'disconnecting' | 'disconnected' | 'disconnection_failed'
  /** connection type */
  readonly 'type': 'DatacloudOrg'
}

export type Connection = SalesforceConnection | DataCloudConnection

export function isSalesforceConnection(connection: Connection): connection is SalesforceConnection {
  return (connection as SalesforceConnection).salesforce_org !== undefined
}

export function isDatacloudConnection(connection: Connection): connection is DataCloudConnection {
  return !isSalesforceConnection(connection)
}

export type ConnectionError = {
  readonly body: {
    readonly id: string
    readonly message: string
  }
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
 * Create Data Action Target process.
 */
export type DataActionTargetCreate = {
  readonly api_name: string
  readonly datacloud_org: {
    readonly id?: string | null
    readonly instance_url?: string | null
    readonly org_name: string
    readonly run_as_user?: string | null
  }
  readonly heroku_app: {
    id: string
    name: string
    url: string
  }
  readonly label: string
  readonly id: string
  readonly state: 'pending' | 'creating' | 'generating_signing_key' | 'signing_key_generated' | 'created' | 'creation_failed'
  readonly target_endpoint: string
  readonly type: string
  readonly error?: {
    id: string
    message: string
  }
}
