import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../../run-command'
import Cmd from '../../../../../src/commands/events/subscriptions/sfdc/create'
import {addon, subscription2} from '../../../../helpers/fixtures'

describe('events:subscriptions:sfdc:create', function () {
  let api: nock.Scope
  let eventsApi: nock.Scope
  const {env} = process

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
      .get('/apps/my-app/addons')
      .reply(200, [addon])
      .get('/apps/my-app/config-vars')
      .reply(200, {
        HEROKUEVENTS_API_URL: 'https://events-api.heroku.com/v1/tenants/01234567-89ab-cdef-0123-456789abcdef',
      })
    eventsApi = nock('https://events-api.heroku.com')
  })

  afterEach(function () {
    process.env = env
    api.done()
    eventsApi.done()
    nock.cleanAll()
  })

  it('creates a subscription for platform Salesforce', async function () {
    eventsApi
      .post('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/platforms/salesforce/subscriptions')
      .reply(200, subscription2)

    await runCommand(Cmd, [
      'fakeOrgAccountChange',
      '--event="/data/AccountChange"',
      "--filter='root = if ChangeEventHeader.ChangeType == \"CREATE\" { this } else { deleted() }'",
      '--org-name="fake-sfdc-org"',
      '--target="fakeOrgAccountCreated"',
      '--app=my-app',
    ])

    expect(stderr.output).to.equal(heredoc`
      Creating subscription fakeOrgAccountChange...
      Creating subscription fakeOrgAccountChange... done
    `)
    expect(stdout.output).to.eq('')
  })
})
