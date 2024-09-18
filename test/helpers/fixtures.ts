import * as Heroku from '@heroku-cli/schema'
import * as Integration from '../../src/lib/integration/types'

export const addon: Heroku.AddOn = {
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

export const connection1: Integration.SalesforceConnection = {
  id: '51807d19-9d78-4064-9468-bcdc34611778',
  salesforce_org: {
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-1',
    run_as_user: 'user@example.com',
  },
  state: 'connected',
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
  state: 'authenticating',
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
  state: 'connected',
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
  state: 'connection_failed',
  type: 'SalesforceOrg',
}

export const appImportPending: Integration.AppImport = {
  id: '94441cc0-0f52-42d1-9a66-9f8e43e9b7eb',
  client_name: 'AccountAPI',
  state: 'pending',
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
  state: 'imported',
}

export const appImportFailed: Integration.AppImport = {
  ...appImportPending,
  state: 'import_failed',
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
  state: 'pending',
  target_endpoint: '/handleDataCloudDataChangeEvent',
  type: 'Webhook',
}

export const datCreateSuccess: Integration.DataActionTargetCreate = {
  ...datCreatePending,
  state: 'created',
}

export const datCreateFailed: Integration.DataActionTargetCreate = {
  ...datCreatePending,
  state: 'creation_failed',
}

export const connection2_disconnected: Integration.SalesforceConnection = {
  id: '5551fe92-c2fb-4ef7-be43-9d927d9a5c53',
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  state: 'disconnected',
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
  state: 'connecting',
  type: 'SalesforceOrg',
}

export const connection4_connecting: Integration.DatacloudConnection = {
  datacloud_org: {
    id: '',
    instance_url: '',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  redirect_uri: 'https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize',
  state: 'authenticating',
  type: 'DatacloudOrg',
}

export const connection4_connected: Integration.DatacloudConnection = {
  datacloud_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: 'user@example.com',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  state: 'connected',
  type: 'DatacloudOrg',
}

export const connection4_failed: Integration.DatacloudConnection = {
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
  state: 'connection_failed',
  type: 'DatacloudOrg',
}

export const connection4_disconnected: Integration.DatacloudConnection = {
  datacloud_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  id: '339b373a-5d0c-4056-bfdd-47a06b79f112',
  state: 'disconnected',
  type: 'DatacloudOrg',
}
