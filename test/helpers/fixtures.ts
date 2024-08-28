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

export const connection1: Integration.Connection = {
  salesforce_org: {
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-1',
    run_as_user: 'user@example.com',
  },
  state: 'connected',
  type: 'SalesforceOrg',
}

export const connection2_connecting: Integration.Connection = {
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

export const connection2_connected: Integration.Connection = {
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: 'user@example.com',
  },
  state: 'connected',
  type: 'SalesforceOrg',
}

export const connection2_failed: Integration.Connection = {
  salesforce_org: {
    id: '00DSG000007a3BcA84',
    instance_url: 'https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-2',
    run_as_user: '',
  },
  state: 'connection_failed',
  type: 'SalesforceOrg',
}

export const connection3: Integration.Connection = {
  salesforce_org: {
    id: '00DSG000007a3FdB96',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
    org_name: 'my-org-1',
    run_as_user: 'user2@example.com',
  },
  state: 'connecting',
  type: 'DatacloudOrg',
}
