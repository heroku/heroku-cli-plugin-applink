export const addon = {
  name: 'heroku-integration-vertical-01234',
  addon_service: {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'heroku-integration',
  },
}

export const connection1 = {
  id: '01234567-89ab-cdef-0123-456789abcdef',
  org: {
    id: '00DSG000007a3FdB96',
    alias: 'fake-sfdc-org',
    instance_url: 'https://dsg000007a3fdb96.test1.my.pc-rnd.salesforce.com',
  },
  run_as_user: 'user@example.com',
  state: 'connected',
  type: 'salesforce',
}

export const connection2 = {
  id: '456789ab-cdef-0123-4567-89abcdef0123',
  org: {
    id: '00DSG00000B72aF69s',
    alias: 'another-sfdc-org',
    instance_url: 'https://dsg00000b72af69s.test1.my.pc-rnd.salesforce.com',
  },
  run_as_user: 'user2@example.com',
  state: 'connected',
  type: 'salesforce',
}
