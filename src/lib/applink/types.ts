/**
 * A connection between a Heroku app and a Salesforce Org.
 */
interface BaseOrg {
  readonly id?: string | null
  readonly instance_url?: string | null
  readonly 'type': 'SalesforceOrg' | 'DataCloudOrg',
  readonly username?: string | null
  readonly user_id?: string | null
}

interface AuthorizationOrg extends BaseOrg {
  readonly developer_name: string
}

interface ConnectionOrg extends BaseOrg {
  readonly connection_name: string
}

export type Org = ConnectionOrg

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
  readonly org: Org
  /** redirect URI for authentication */
  readonly redirect_uri?: string | null
  /** connection status */
  readonly status: ConnectionStatus
  readonly addon_id?: string
  readonly created_via_app: string
  readonly created_at: string
  readonly last_modified_at: string
  readonly created_by: string
  readonly last_modified_by: string
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
  readonly org: Org
  /** redirect URI for authentication */

  readonly redirect_uri?: string | null
  /** connection status */
  readonly status: ConnectionStatus
  readonly addon_id?: string
  readonly created_via_app: string
  readonly created_at: string
  readonly last_modified_at: string
  readonly created_by: string
  readonly last_modified_by: string
}

export type Connection = SalesforceConnection | DataCloudConnection

export function isSalesforceConnection(connection: Connection): connection is SalesforceConnection {
  return (connection as SalesforceConnection).org !== undefined
}

export function isDataCloudConnection(connection: Connection): connection is DataCloudConnection {
  return !isSalesforceConnection(connection)
}

export function adjustOrgType(type: string | undefined): string | undefined {
  return type === 'DatacloudOrg' ? 'DataCloudOrg' : type
}

export type ConnectionError = {
  readonly body: {
    readonly id: string
    readonly message: string
  }
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error'
export type AuthorizationStatus = 'authorized' | 'authorizing' | 'disconnected' | 'error'

/**
 * An app publish process.
 */
export type AppPublish = {
  app_request: {
    /** client name */
    client_name: string
    /** authorization connected app name */
    authorization_connected_app_name?: string
    /** authorization permission set name */
    authorization_permission_set_name?: string
  }
  metadata: Buffer
}

/**
 * Create Data Action Target process.
 */
export type DataActionTargetCreate = {
  readonly api_name: string
  readonly org: Org
  readonly heroku_app: {
    id: string
    name: string
    url: string
  }
  readonly label: string
  readonly id: string
  /** process status */
  readonly status: 'pending' | 'creating' | 'generating_signing_key' | 'created' | 'creation_failed'
  readonly target_endpoint: string
  readonly type: string
  readonly error?: {
    id: string
    message: string
  }
}

/**
 * Create Authorization process.
 */
export type Authorization = {
  readonly id: string
  readonly status: AuthorizationStatus
  readonly redirect_uri?: string
  readonly created_at: string
  readonly last_modified_at: string,
  readonly app_name?: string
  readonly org: AuthorizationOrg
  readonly created_by: string
  readonly last_modified_by: string
  readonly created_via_app: string
  readonly error?: {
    id: string
    message: string
  }
}

/**
 * Represents a file entry with its name and content.
 */
export type FileEntry = {
  /** file name */
  readonly name: string;
  /** file content as a Buffer */
  readonly content: Buffer;
}

/**
 * Heroku App Publication to a Salesforce Org.
 */
export type Publication = {
  readonly app_uuid: string,
  readonly heroku_applink_id: string,
  readonly esr_id: string,
  readonly esr_name: string,
  readonly connection_name: string,
  readonly org_id: string,
  readonly created_at: string,
  readonly last_modified_at: string,
  readonly created_by: string,
  readonly last_modified_by: string,
}

export type CredsCredential = {
  readonly id: string,
  readonly status: ConnectionStatus,
  readonly org: Org,
  readonly app_id: string,
  readonly addon_id: string,
  readonly created_at: string,
  readonly last_modified_at: string,
  readonly created_by: string,
  readonly last_modified_by: string,
  readonly connection_method: 'JWT'
}

export type StandardApplinkError = {
  readonly type: string
  readonly status: number
  readonly title: string
  readonly detail: string
  readonly instance: string
}
