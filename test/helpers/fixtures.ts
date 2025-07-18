import * as Heroku from '@heroku-cli/schema'
import * as AppLink from '../../src/lib/applink/types'
import * as HerokuSDK from '../../src/lib/types'

export const app: Heroku.App = {
  id: '89abcdef-0123-4567-89ab-cdef01234567',
  name: 'my-app',
}

export const app2: Heroku.App = {
  id: 'abcdef01-2345-6789-abcd-ef0123456789',
  name: 'my-other-app',
}

export const addon: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  addon_service: {
    id: '23456789-abcd-ef01-2345-6789abcdef01',
    name: 'heroku-applink',
  },
  app,
  id: '01234567-89ab-cdef-0123-456789abcdef',
  name: 'heroku-applink-vertical-01234',
}

export const addon2: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  addon_service: {
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    name: 'heroku-applink',
  },
  app: app2,
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'heroku-applink-horizontal-01234',
}

export const addonStaging: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  addon_service: {
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    name: 'heroku-applink-staging',
  },
  app: app2,
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'heroku-applink-staging-01234',
}

export const addonAttachment: Heroku.AddOnAttachment = {
  id: '01234567-89ab-cdef-0123-456789abcdef',
  addon: {
    id: addon.id!,
    name: addon.name!,
    app,
  },
  name: 'HEROKU_APPLINK',
}

export const addonAttachment2: Heroku.AddOnAttachment = {
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  addon: {
    id: addon2.id!,
    name: addon2.name!,
    app: app2,
  },
  name: 'HEROKU_APPLINK_COBALT',
}

export const addonAttachmentStaging: Heroku.AddOnAttachment = {
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  addon: {
    id: addonStaging.id!,
    name: addonStaging.name!,
    app: app2,
  },
  name: 'HEROKU_APPLINK_STAGING',
}

export const connection1: AppLink.SalesforceConnection = {
  id: '51807d19-9d78-4064-9468-bcdc34611778',
  org: {
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-1',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'connected',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection2_connecting: AppLink.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  org: {
    id: '',
    instance_url: '',
    connection_name: 'my-org-2',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  redirect_uri: 'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  status: 'connecting',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection2_connected: AppLink.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'connected',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection3_connected_failed: AppLink.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-3',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection2_failed: AppLink.SalesforceConnection = {
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting your org. Try again later.',
  },
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const datCreatePending: AppLink.DataActionTargetCreate = {
  id: '94441cc0-0f52-42d1-9a66-9f8e43e9b7eb',
  api_name: 'MyDataActionTarget',
  org: {
    id: '00DSG00000DGEIr2AP',
    connection_name: 'productionOrg',
    instance_url: 'https://dsg00000dgeir2ap.test1.my.pc-rnd.salesforce.com',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  heroku_app: {
    id: '991383ba-b3bc-4a86-b606-2df760573bc0',
    name: 'hint4aa8373ef0bb57ff28226530',
    url: 'https://hint4aa8373ef0bb57ff28226530-229438e187dc.herokuapp.com/',
  },
  label: 'My Data Action Target',
  status: 'pending',
  target_endpoint: '/handleDataCloudDataChangeEvent',
  type: 'webhook',
}

export const datCreateSuccess: AppLink.DataActionTargetCreate = {
  ...datCreatePending,
  status: 'created',
}

export const datCreateFailed: AppLink.DataActionTargetCreate = {
  ...datCreatePending,
  status: 'creation_failed',
}

export const connection2_disconnected: AppLink.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'disconnected',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection3: AppLink.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  org: {
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-1',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'connecting',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection4_connecting: AppLink.DataCloudConnection = {
  org: {
    id: '',
    instance_url: '',
    connection_name: 'my-org-2',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  redirect_uri: 'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  status: 'connecting',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection4_connected: AppLink.DataCloudConnection = {
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'connected',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection4_failed: AppLink.DataCloudConnection = {
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting your org. Try again later.',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'failed',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection4_disconnected: AppLink.DataCloudConnection = {
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'disconnected',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection5_disconnecting: AppLink.DataCloudConnection = {
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'disconnecting',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const connection5_disconnection_failed: AppLink.DataCloudConnection = {
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'DataCloudOrg',
    username: 'admin@applink.org',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'failed',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const ConnectionError_record_not_found: AppLink.ConnectionError = {
  body: {
    id: 'record_not_found',
    message: 'record not found',
  },
}

export const connection_record_not_found: AppLink.SalesforceConnection = {
  error: {
    id: 'record_not_found',
    message: 'record not found',
  },
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-org-2',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
  status: 'failed',
  created_via_app: app.name!,
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const authorization_connected: AppLink.Authorization = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  status: 'authorized',
  redirect_uri: 'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  app_name: app.name!,
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    developer_name: 'my-developer-name',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
    user_id: 'user_id',
  },
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
  created_via_app: app.name!,
}

export const authorization_connected_2: AppLink.Authorization = {
  ...authorization_connected,
  status: 'authorized',
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    developer_name: 'my-developer-name-2',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
}

export const authorization_connected_3_failed: AppLink.Authorization = {
  ...authorization_connected,
  status: 'failed',
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    developer_name: 'my-developer-name-3',
    type: 'SalesforceOrg',
    username: 'admin@applink.org',
  },
}

export const authorization_pending: AppLink.Authorization = {
  ...authorization_connected,
  status: 'authorizing',
}

export const authorization_authenticating: AppLink.Authorization = {
  ...authorization_connected,
  status: 'authorizing',
}

export const authorization_connection_failed: AppLink.Authorization = {
  ...authorization_connected,
  status: 'disconnected',
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting to your org. Try again later.',
  },
}

export const authorization_disconnected: AppLink.Authorization = {
  ...authorization_connected,
  status: 'disconnected',
}

export const authorization_not_found: AppLink.Authorization = {
  ...authorization_connection_failed,
  error: {
    id: 'record_not_found',
    message: 'record not found',
  },
}

export const sso_response: HerokuSDK.SSO = {
  method: 'post',
  action: 'https://applink.heroku.com/sso/login',
  params: {
    email: 'user@example.com',
    user_id: '1234567890',
    app: app.name!,
    context_app: app2.name!,
    timestamp: '2021-01-01T00:00:00Z',
    'nav-data': 'nav-data',
    id: '1234567890',
    token: '1234567890',
    resource_id: '1234567890',
    resource_token: '1234567890',
    user_scoped_resource_token: '1234567890',
  },
}

export const publication1: AppLink.Publication = {
  app_uuid: '89abcdef-0123-4567-89ab-cdef01234567',
  heroku_applink_id: '51807d19-9d78-4064-9468-bcdc34611778',
  esr_id: '51807d19',
  esr_name: 'esrName',
  connection_name: 'connection1',
  org_id: '00DSG000007a3BcA84',
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const publication2: AppLink.Publication = {
  app_uuid: '89abcdef-0123-4567-89ab-cdef01234567',
  heroku_applink_id: '51807d19-9d78-4064-9468-bcdc34611778',
  esr_id: '51807d19',
  esr_name: 'esrName',
  connection_name: 'connection2',
  org_id: '00DSG000007a3BcA84',
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const credential_id_connected: AppLink.CredsCredential = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  status: 'connected',
  org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    connection_name: 'my-connection-1',
    type: 'SalesforceOrg',
    username: 'test-username',
  },
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
  app_id: '89abcdef-0123-4567-89ab-cdef01234567',
  addon_id: '01234567-89ab-cdef-0123-456789abcdef',
  connection_method: 'JWT',
}

export const credential_id_failed: AppLink.CredsCredential = {
  ...credential_id_connected,
  status: 'failed',
}
