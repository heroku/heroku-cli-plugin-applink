import * as Events from '../../src/lib/events/types'

export const addon = {
  name: 'herokuevents-horizontal-01234',
  addon_service: {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'herokuevents',
  },
}

export const authorization1 = {
  id: '01234567-89ab-cdef-0123-456789abcdef',
  params: {
    org_name: 'example-org',
    url: 'https://example-org.my.salesforce.com',
  },
  platform: 'salesforce',
}

export const authorization2 = {
  extra: null,
  id: '456789ab-cdef-0123-4567-89abcdef0123',
  params: {
    org_name: 'fake-sfdc-org',
    url: 'https://fake-sfdc-org.my.salesforce.com',
  },
  platform: 'salesforce',
}

export const subscription: Events.Subscription = {
  id: '87756ff1-be2f-4dcd-980a-fba82c0e04b0',
  name: 'herokuEventsSystemStatus',
  params: {
    interval: '1m', mapping: 'root = {"status": "up\', "created_at": timestamp_unix_milli()}',
  },
  platform: 'generate',
  targets: [
    {
      id: '8ecd4d31-191f-4c40-9fa7-0a3c5ab28142',
      filter: null,
      name: 'hempSystemStatusFakeOrg',
      params: {
        event: '/event/Hemp_System_Status__e',
        org_name: 'fake-sfdc-org',
      },
      platform: 'salesforce',
    },
    {
      id: 'f39974c4-cd1f-4c5c-81f3-2ae56eec0657',
      filter: null,
      name: 'hempSystemStatusNotAnOrg',
      params: {
        event: '/event/Hemp_System_Status__e',
        org_name: 'not-a-sfdc-org',
      },
      platform: 'salesforce',
    },
  ],
}

export const publication1: Events.Publication = {
  id: '8ecd4d31-191f-4c40-9fa7-0a3c5ab28142',
  name: 'hempSystemStatusFakeOrg',
  params: {event: '/event/Hemp_System_Status__e', org_name: 'fake-sfdc-org'},
  platform: 'salesforce',
  sources: [
    {
      id: '87756ff1-be2f-4dcd-980a-fba82c0e04b0',
      filter: null,
      name: 'herokuEventsSystemStatus',
      params: {
        interval: '1m',
        mapping: 'root = {"status": "up", "created_at": timestamp_unix_milli()}',
      },
      platform: 'generate',
    },
  ],
}

export const publication2: Events.Publication = {
  id: 'beabd9f6-cf0a-4469-a956-de4d2e4ffda0',
  name: 'fakeOrgAccountCreated',
  params: {
    url: 'https://suscipit-laudantium-ratione-23cc2b95ee13/api/webhooks/fake-sfdc-org',
  },
  platform: 'webhook',
  sources: [
    {
      id: '5d25c8a0-28b1-44fc-b6c0-e91fa018a42f',
      filter: 'root = if ChangeEventHeader.ChangeType == "CREATE" { this } else { deleted() }',
      name: 'fakeOrgAccountChange',
      params: {
        event: '/data/AccountChange',
        org_name: 'fake-sfdc-org',
      },
      platform: 'salesforce',
    },
  ],
}
