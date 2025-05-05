import * as Heroku from '@heroku-cli/schema'
import * as AppLink from '../../src/lib/applink/types'

export const addon: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  addon_service: {
    id: '23456789-abcd-ef01-2345-6789abcdef01',
    name: 'heroku-applink',
  },
  app: {
    id: '89abcdef-0123-4567-89ab-cdef01234567',
    name: 'my-app',
  },
  id: '01234567-89ab-cdef-0123-456789abcdef',
  name: 'heroku-applink-vertical-01234',
}

export const addon2: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  addon_service: {
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    name: 'heroku-applink',
  },
  app: {
    id: 'abcdef01-2345-6789-abcd-ef0123456789',
    name: 'my-other-app',
  },
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'heroku-applink-horizontal-01234',
}

export const legacyAddon: Heroku.AddOn = {
  config_vars: ['HEROKU_INTEGRATION_API_URL', 'HEROKU_INTEGRATION_TOKEN'],
  addon_service: {
    id: '23456789-abcd-ef01-2345-6789abcdef01',
    name: 'heroku-integration',
  },
  app: {
    id: '89abcdef-0123-4567-89ab-cdef01234567',
    name: 'my-app',
  },
  id: '01234567-89ab-cdef-0123-456789abcdef',
  name: 'heroku-integration-vertical-01234',
}

export const addonStaging: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  addon_service: {
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    name: 'heroku-applink-staging',
  },
  app: {
    id: 'abcdef01-2345-6789-abcd-ef0123456789',
    name: 'my-other-app',
  },
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'heroku-applink-staging-01234',
}

export const connection1: AppLink.SalesforceConnection = {
  id: '51807d19-9d78-4064-9468-bcdc34611778',
  salesforce_org: {
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-1',
    run_as_user: 'user@example.com',
  },
  status: 'connected',
  type: 'SalesforceOrg',
}

export const connection2_connecting: AppLink.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  salesforce_org: {
    id: '',
    instance_url: '',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  redirect_uri: 'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  status: 'authenticating',
  type: 'SalesforceOrg',
}

export const connection2_connected: AppLink.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: 'user@example.com',
  },
  status: 'connected',
  type: 'SalesforceOrg',
}

export const connection2_failed: AppLink.SalesforceConnection = {
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting your org. Try again later.',
  },
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  status: 'connection_failed',
  type: 'SalesforceOrg',
}

export const appImportPending: AppLink.AppImport = {
  id: '94441cc0-0f52-42d1-9a66-9f8e43e9b7eb',
  client_name: 'AccountAPI',
  status: 'pending',
  generate_authorization_permission_set: true,
  salesforce_org: {
    id: '00DSG00000DGEIr2AP',
    org_name: 'productionOrg',
    instance_url: 'https://dsg00000dgeir2ap.test1.my.pc-rnd.salesforce.com',
    run_as_user: 'paguilar@salesforce.com',
  },
  heroku_app: {
    id: '991383ba-b3bc-4a86-b606-2df760573bc0',
    name: 'hint4aa8373ef0bb57ff28226530',
    url: 'https://hint4aa8373ef0bb57ff28226530-229438e187dc.herokuapp.com/',
  },
}

export const appImportSuccess: AppLink.AppImport = {
  ...appImportPending,
  status: 'imported',
}

export const appImportFailed: AppLink.AppImport = {
  ...appImportPending,
  status: 'import_failed',
}

export const datCreatePending: AppLink.DataActionTargetCreate = {
  id: '94441cc0-0f52-42d1-9a66-9f8e43e9b7eb',
  api_name: 'MyDataActionTarget',
  datacloud_org: {
    id: '00DSG00000DGEIr2AP',
    org_name: 'productionOrg',
    instance_url: 'https://dsg00000dgeir2ap.test1.my.pc-rnd.salesforce.com',
  },
  heroku_app: {
    id: '991383ba-b3bc-4a86-b606-2df760573bc0',
    name: 'hint4aa8373ef0bb57ff28226530',
    url: 'https://hint4aa8373ef0bb57ff28226530-229438e187dc.herokuapp.com/',
  },
  label: 'My Data Action Target',
  status: 'pending',
  target_endpoint: '/handleDataCloudDataChangeEvent',
  type: 'Webhook',
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
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  status: 'disconnected',
  type: 'SalesforceOrg',
}

export const connection3: AppLink.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  salesforce_org: {
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-1',
    run_as_user: 'user2@example.com',
  },
  status: 'connecting',
  type: 'SalesforceOrg',
}

export const connection4_connecting: AppLink.DataCloudConnection = {
  datacloud_org: {
    id: '',
    instance_url: '',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  redirect_uri: 'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  status: 'authenticating',
  type: 'DatacloudOrg',
}

export const connection4_connected: AppLink.DataCloudConnection = {
  datacloud_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: 'user@example.com',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'connected',
  type: 'DatacloudOrg',
}

export const connection4_failed: AppLink.DataCloudConnection = {
  datacloud_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting your org. Try again later.',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'connection_failed',
  type: 'DatacloudOrg',
}

export const connection4_disconnected: AppLink.DataCloudConnection = {
  datacloud_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'disconnected',
  type: 'DatacloudOrg',
}

export const connection5_disconnecting: AppLink.DataCloudConnection = {
  datacloud_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'disconnecting',
  type: 'DatacloudOrg',
}

export const connection5_disconnection_failed: AppLink.DataCloudConnection = {
  datacloud_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  status: 'disconnection_failed',
  type: 'DatacloudOrg',
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
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  status: 'connection_failed',
  type: 'SalesforceOrg',
}

export const authorization_connected: AppLink.Authorization = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  status: 'connected',
  redirect_uri: 'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  created_at: '2021-01-01T00:00:00Z',
  last_modified_at: '2021-01-01T00:00:00Z',
  developer_name: 'my-developer-name',
  app_name: 'my-app',
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-1',
    run_as_user: 'user@example.com',
  },
  type: 'SalesforceOrg',
  created_by: 'user@example.com',
  last_modified_by: 'user@example.com',
}

export const authorization_connected_2: AppLink.Authorization = {
  ...authorization_connected,
  status: 'connected',
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: 'user@example.com',
  },
}

export const authorization_pending: AppLink.Authorization = {
  ...authorization_connected,
  status: 'pending',
}

export const authorization_authenticating: AppLink.Authorization = {
  ...authorization_connected,
  status: 'authenticating',
}

export const authorization_connection_failed: AppLink.Authorization = {
  ...authorization_connected,
  status: 'connection_failed',
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
