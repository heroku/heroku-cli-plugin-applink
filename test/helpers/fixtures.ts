import * as Heroku from '@heroku-cli/schema'
import * as Integration from '../../src/lib/integration/types'

export const addon: Heroku.AddOn = {
  name: 'heroku-integration-vertical-01234',
  addon_service: {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'heroku-integration',
  },
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
