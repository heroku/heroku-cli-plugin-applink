import * as Heroku from '@heroku-cli/schema'
import * as Integration from '../../src/lib/integration/types'

export const addon: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
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

export const addon2: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  addon_service: {
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    name: 'heroku-integration',
  },
  app: {
    id: 'abcdef01-2345-6789-abcd-ef0123456789',
    name: 'my-other-app',
  },
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'heroku-integration-horizontal-01234',
}

export const addonStaging: Heroku.AddOn = {
  config_vars: ['HEROKU_APPLINK_API_URL', 'HEROKU_APPLINK_TOKEN'],
  addon_service: {
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    name: 'heroku-integration-staging',
  },
  app: {
    id: 'abcdef01-2345-6789-abcd-ef0123456789',
    name: 'my-other-app',
  },
  id: '6789abcd-ef01-2345-6789-abcdef012345',
  name: 'heroku-integration-staging-01234',
}

export const connection1: Integration.SalesforceConnection = {
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

export const connection2_connecting: Integration.SalesforceConnection = {
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

export const connection2_connected: Integration.SalesforceConnection = {
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

export const connection2_failed: Integration.SalesforceConnection = {
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

export const appImportPending: Integration.AppImport = {
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

export const appImportSuccess: Integration.AppImport = {
  ...appImportPending,
  status: 'imported',
}

export const appImportFailed: Integration.AppImport = {
  ...appImportPending,
  status: 'import_failed',
}

export const datCreatePending: Integration.DataActionTargetCreate = {
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

export const datCreateSuccess: Integration.DataActionTargetCreate = {
  ...datCreatePending,
  status: 'created',
}

export const datCreateFailed: Integration.DataActionTargetCreate = {
  ...datCreatePending,
  status: 'creation_failed',
}

export const connection2_disconnected: Integration.SalesforceConnection = {
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

export const connection3: Integration.SalesforceConnection = {
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

export const connection4_connecting: Integration.DataCloudConnection = {
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

export const connection4_connected: Integration.DataCloudConnection = {
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

export const connection4_failed: Integration.DataCloudConnection = {
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

export const connection4_disconnected: Integration.DataCloudConnection = {
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

export const connection5_disconnecting: Integration.DataCloudConnection = {
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

export const connection5_disconnection_failed: Integration.DataCloudConnection = {
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

export const ConnectionError_record_not_found: Integration.ConnectionError = {
  body: {
    id: 'record_not_found',
    message: 'record not found',
  },
}

export const connection_record_not_found: Integration.SalesforceConnection = {
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

export const authorization_pending: Integration.Authorization = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  developer_name: 'my-auth-1',
  status: 'pending',
  redirect_uri: 'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  created_at: '2025-04-23T12:00:00Z',
  last_modified_by: 'user@example.com',
  created_by: 'user@example.com',
  last_modified_at: '2025-04-23T12:00:00Z',
}

export const authorization_authenticating: Integration.Authorization = {
  ...authorization_pending,
  status: 'authenticating',
}

export const authorization_connected: Integration.Authorization = {
  ...authorization_pending,
  status: 'connected',
}

export const authorization_connection_failed: Integration.Authorization = {
  ...authorization_pending,
  status: 'connection_failed',
  error: {
    id: 'org_connection_failed',
    message: 'There was a problem connecting to your org. Try again later.',
  },
}

export const authorization_disconnected: Integration.Authorization = {
  ...authorization_pending,
  status: 'disconnected',
}
