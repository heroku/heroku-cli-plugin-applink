/**
 * A connection between a Heroku app and a Salesforce Org.
 */
interface BaseOrg {
  readonly id?: null | string;
  readonly instance_url?: null | string;
  readonly type: 'DataCloudOrg' | 'SalesforceOrg';
  readonly user_id?: null | string;
  readonly username?: null | string;
}

interface AuthorizationOrg extends BaseOrg {
  readonly developer_name: string;
}

interface ConnectionOrg extends BaseOrg {
  readonly connection_name: string;
}

export type Org = ConnectionOrg;

/**
 * A connection between a Heroku app and a Salesforce Org.
 */
export type SalesforceConnection = {
  readonly addon_id?: string;
  readonly created_at: string;
  readonly created_by: string;
  readonly created_via_app: string;
  /** last error on connection */
  readonly error?: {
    id: string;
    message: string;
  };
  /** connection ID */
  readonly id: string;
  readonly last_modified_at: string;
  readonly last_modified_by: string;
  /** Salesforce Org info */
  readonly org: Org;
  /** redirect URI for authentication */
  readonly redirect_uri?: null | string;
  /** connection status */
  readonly status: ConnectionStatus;
};

/**
 * A connection between a Data Cloud Org and Heroku app.
 */
export type DataCloudConnection = {
  readonly addon_id?: string;
  readonly created_at: string;
  readonly created_by: string;
  /** redirect URI for authentication */

  readonly created_via_app: string;
  /** last error on connection */
  readonly error?: {
    id: string;
    message: string;
  };
  /** connection ID */
  readonly id: string;
  readonly last_modified_at: string;
  readonly last_modified_by: string;
  /** Data Cloud Org info */
  readonly org: Org;
  readonly redirect_uri?: null | string;
  /** connection status */
  readonly status: ConnectionStatus;
};

export type Connection = DataCloudConnection | SalesforceConnection;

export function isSalesforceConnection(connection: Connection): connection is SalesforceConnection {
  return (connection as SalesforceConnection).org !== undefined;
}

export function isDataCloudConnection(connection: Connection): connection is DataCloudConnection {
  return !isSalesforceConnection(connection);
}

export function adjustOrgType(type: string | undefined): string | undefined {
  return type === 'DatacloudOrg' ? 'DataCloudOrg' : type;
}

export type ConnectionError = {
  readonly body: {
    readonly id: string;
    readonly message: string;
  };
};

export type ConnectionStatus
  = | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'disconnecting'
  | 'failed';
export type AuthorizationStatus
  = | 'authorized'
  | 'authorizing'
  | 'disconnected'
  | 'failed';

/**
 * An app publish process.
 */
export type AppPublish = {
  app_request: {
    /** authorization connected app name */
    authorization_connected_app_name?: string;
    /** authorization permission set name */
    authorization_permission_set_name?: string;
    /** client name */
    client_name: string;
  };
  metadata: Buffer;
};

/**
 * Create Data Action Target process.
 */
export type DataActionTargetCreate = {
  readonly api_name: string;
  readonly error?: {
    id: string;
    message: string;
  };
  readonly heroku_app: {
    id: string;
    name: string;
    url: string;
  };
  readonly id: string;
  readonly label: string;
  readonly org: Org;
  /** process status */
  readonly status:
    | 'created'
    | 'creating'
    | 'creation_failed'
    | 'generating_signing_key'
    | 'pending';
  readonly target_endpoint: string;
  readonly type: string;
};

/**
 * A Data Action Target.
 */
export type DataActionTarget = {
  readonly api_name: string;
  readonly app_id: string;
  readonly connection_id: string;
  readonly id: string;
  readonly label: string;
  readonly status: string;
  readonly target_endpoint: string;
  readonly type: string;
};

/**
 * Create Authorization process.
 */
export type Authorization = {
  readonly app_name?: string;
  readonly connection_method?: 'JWT' | 'OAuth';
  readonly created_at: string;
  readonly created_by: string;
  readonly created_via_app: string;
  readonly error?: {
    id: string;
    message: string;
  };
  readonly id: string;
  readonly last_modified_at: string;
  readonly last_modified_by: string;
  readonly org: AuthorizationOrg;
  readonly redirect_uri?: string;
  readonly status: AuthorizationStatus;
};

/**
 * Represents a file entry with its name and content.
 */
export type FileEntry = {
  /** file content as a Buffer */
  readonly content: Buffer;
  /** file name */
  readonly name: string;
};

/**
 * Heroku App Publication to a Salesforce Org.
 */
export type Publication = {
  readonly app_uuid: string;
  readonly connection_name: string;
  readonly created_at: string;
  readonly created_by: string;
  readonly esr_id: string;
  readonly esr_name: string;
  readonly heroku_applink_id: string;
  readonly last_modified_at: string;
  readonly last_modified_by: string;
  readonly org_id: string;
};

export type CredsCredential = {
  readonly addon_id: string;
  readonly app_id: string;
  readonly connection_method: 'JWT';
  readonly created_at: string;
  readonly created_by: string;
  readonly id: string;
  readonly last_modified_at: string;
  readonly last_modified_by: string;
  readonly org: Org;
  readonly status: ConnectionStatus;
};
