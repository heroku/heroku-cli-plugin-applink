import * as Heroku from '@heroku-cli/schema';

import * as AppLink from '../../src/lib/applink/types.js';
import * as HerokuSDK from '../../src/lib/types.js';

export const app: Heroku.App = {
  id: '89abcdef-0123-4567-89ab-cdef01234567',
  name: 'my-app',
};

export const app2: Heroku.App = {
  id: 'abcdef01-2345-6789-abcd-ef0123456789',
  name: 'my-other-app',
};

export const addon: Heroku.AddOn = {
  addon_service: {
    id: '23456789-abcd-ef01-2345-6789abcdef01',
    name: 'heroku-applink',
  },
  app,
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  id: '01234567-89ab-cdef-0123-456789abcdef',
  name: 'heroku-applink-vertical-01234',
};

export const addon2: Heroku.AddOn = {
  addon_service: {
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    name: 'heroku-applink',
  },
  app: app2,
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'heroku-applink-horizontal-01234',
};

export const addonStaging: Heroku.AddOn = {
  addon_service: {
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    name: 'heroku-applink-staging',
  },
  app: app2,
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'heroku-applink-staging-01234',
};

export const addonAttachment: Heroku.AddOnAttachment = {
  addon: {
    app,
    id: addon.id!,
    name: addon.name!,
  },
  id: '01234567-89ab-cdef-0123-456789abcdef',
  name: 'HEROKU_APPLINK',
};

export const addonAttachment2: Heroku.AddOnAttachment = {
  addon: {
    app: app2,
    id: addon2.id!,
    name: addon2.name!,
  },
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'HEROKU_APPLINK_COBALT',
};

export const addonAttachmentStaging: Heroku.AddOnAttachment = {
  addon: {
    app: app2,
    id: addonStaging.id!,
    name: addonStaging.name!,
  },
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'HEROKU_APPLINK_STAGING',
};

export const connection1: AppLink.SalesforceConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '51807d19-9d78-4064-9468-bcdc34611778',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-1',
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'connected',
};

export const connection2_connecting: AppLink.SalesforceConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '',
    instance_url: '',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  redirect_uri:
    'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  status: 'connecting',
};

export const connection2_connected: AppLink.SalesforceConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'connected',
};

export const connection3_connected_failed: AppLink.SalesforceConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-3',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
};

export const connection2_failed: AppLink.SalesforceConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting your org. Try again later.',
  },
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
};

export const datCreatePending: AppLink.DataActionTargetCreate = {
  api_name: 'MyDataActionTarget',
  heroku_app: {
    id: '991383ba-b3bc-4a86-b606-2df760573bc0',
    name: 'hint4aa8373ef0bb57ff28226530',
    url: 'https://hint4aa8373ef0bb57ff28226530-229438e187dc.herokuapp.com/',
  },
  id: '94441cc0-0f52-42d1-9a66-9f8e43e9b7eb',
  label: 'My Data Action Target',
  org: {
    connection_name: 'productionOrg',
    id: '00DSG00000DGEIr2AP',
    instance_url: 'https://dsg00000dgeir2ap.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'pending',
  target_endpoint: '/handleDataCloudDataChangeEvent',
  type: 'webhook',
};

export const datCreateSuccess: AppLink.DataActionTargetCreate = {
  ...datCreatePending,
  status: 'created',
};

export const datCreateFailed: AppLink.DataActionTargetCreate = {
  ...datCreatePending,
  status: 'creation_failed',
};

export const connection2_disconnected: AppLink.SalesforceConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'disconnected',
};

export const connection3: AppLink.SalesforceConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-1',
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'connecting',
};

export const connection4_connecting: AppLink.DataCloudConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '',
    instance_url: '',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  redirect_uri:
    'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  status: 'connecting',
};

export const connection4_connected: AppLink.DataCloudConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  status: 'connected',
};

export const connection4_failed: AppLink.DataCloudConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting your org. Try again later.',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
};

export const connection4_disconnected: AppLink.DataCloudConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  status: 'disconnected',
};

export const connection5_disconnecting: AppLink.DataCloudConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  status: 'disconnecting',
};

export const connection5_disconnection_failed: AppLink.DataCloudConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
};

export const ConnectionError_record_not_found: AppLink.ConnectionError = {
  body: {
    id: 'record_not_found',
    message: 'record not found',
  },
};

export const connection_record_not_found: AppLink.SalesforceConnection = {
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  error: {
    id: 'record_not_found',
    message: 'record not found',
  },
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-org-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
};

export const authorization_connected: AppLink.Authorization = {
  app_name: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    developer_name: 'my-developer-name',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    user_id: 'user_id',
    username: 'admin@applink.org',
  },
  redirect_uri:
    'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  status: 'authorized',
};

export const authorization_connected_2: AppLink.Authorization = {
  ...authorization_connected,
  org: {
    developer_name: 'my-developer-name-2',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'authorized',
};

export const authorization_connected_3_failed: AppLink.Authorization = {
  ...authorization_connected,
  org: {
    developer_name: 'my-developer-name-3',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
};

export const authorization_pending: AppLink.Authorization = {
  ...authorization_connected,
  status: 'authorizing',
};

export const authorization_authenticating: AppLink.Authorization = {
  ...authorization_connected,
  status: 'authorizing',
};

export const authorization_connection_failed: AppLink.Authorization = {
  ...authorization_connected,
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting to your org. Try again later.',
  },
  status: 'disconnected',
};

export const authorization_disconnected: AppLink.Authorization = {
  ...authorization_connected,
  status: 'disconnected',
};

export const authorization_not_found: AppLink.Authorization = {
  ...authorization_connection_failed,
  error: {
    id: 'record_not_found',
    message: 'record not found',
  },
};

export const sso_response: HerokuSDK.SSO = {
  action: 'https://applink.heroku.com/sso/login',
  method: 'post',
  params: {
    app: app.name!,
    context_app: app2.name!,
    email: 'user@example.com',
    id: '1234567890',
    'nav-data': 'nav-data',
    resource_id: '1234567890',
    resource_token: '1234567890',
    timestamp: '2021-01-01T00:00:00Z',
    token: '1234567890',
    user_id: '1234567890',
    user_scoped_resource_token: '1234567890',
  },
};

export const publication1: AppLink.Publication = {
  app_uuid: '89abcdef-0123-4567-89ab-cdef01234567',
  connection_name: 'connection1',
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  esr_id: '51807d19',
  esr_name: 'esrName',
  heroku_applink_id: '51807d19-9d78-4064-9468-bcdc34611778',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org_id: '00DSG000007a3BcA84',
};

export const publication2: AppLink.Publication = {
  app_uuid: '89abcdef-0123-4567-89ab-cdef01234567',
  connection_name: 'connection2',
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  esr_id: '51807d19',
  esr_name: 'esrName',
  heroku_applink_id: '51807d19-9d78-4064-9468-bcdc34611778',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org_id: '00DSG000007a3BcA84',
};

export const credential_id_connected: AppLink.CredsCredential = {
  addon_id: '01234567-89ab-cdef-0123-456789abcdef',
  app_id: '89abcdef-0123-4567-89ab-cdef01234567',
  connection_method: 'JWT',
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    connection_name: 'my-connection-1',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'test-username',
  },
  status: 'connected',
};

export const credential_id_failed: AppLink.CredsCredential = {
  ...credential_id_connected,
  status: 'failed',
};

export const authorization_jwt_authorized: AppLink.Authorization = {
  app_name: app.name!,
  connection_method: 'JWT',
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '7751fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    developer_name: 'my-jwt-auth',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    user_id: 'user_id',
    username: 'admin@applink.org',
  },
  status: 'authorized',
};

export const authorization_jwt_failed: AppLink.Authorization = {
  ...authorization_jwt_authorized,
  error: {
    id: 'authentication_failed',
    message: 'JWT authentication failed',
  },
  status: 'failed',
};

export const authorization_jwt_authorizing: AppLink.Authorization = {
  ...authorization_jwt_authorized,
  status: 'authorizing',
};

export const authorization_datacloud_jwt_authorized: AppLink.Authorization = {
  app_name: app.name!,
  connection_method: 'JWT',
  created_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  created_via_app: app.name!,
  id: '8851fe92-c2fb-4ef7-be43-9d927d9a5c53',
  last_modified_at: '2021-01-01T00:00:00Z',
  last_modified_by: 'user@example.com',
  org: {
    developer_name: 'my-jwt-auth',
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    type: 'DataCloudOrg',
    user_id: 'user_id',
    username: 'admin@applink.org',
  },
  status: 'authorized',
};

export const authorization_datacloud_jwt_failed: AppLink.Authorization = {
  ...authorization_datacloud_jwt_authorized,
  error: {
    id: 'authentication_failed',
    message: 'JWT authentication failed',
  },
  status: 'failed',
};

export const authorization_datacloud_jwt_authorizing: AppLink.Authorization = {
  ...authorization_datacloud_jwt_authorized,
  status: 'authorizing',
};
