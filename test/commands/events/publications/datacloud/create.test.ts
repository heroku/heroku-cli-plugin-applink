import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../../run-command'
import Cmd from '../../../../../src/commands/events/publications/datacloud/create'
import {addon, publication3} from '../../../../helpers/fixtures'

describe('events:publications:datacloud:create', function () {
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

  it('creates a publication for platform Datacloud', async function () {
    eventsApi
      .post('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/platforms/datacloud/publications')
      .reply(200, publication3)

    await runCommand(Cmd, [
      'highPriorityOrders',
      '--connector="salesConnector"',
      '--filter="root = if Order.TotalValue >= 100_000 { this } else { deleted() }"',
      '--object="HighPriorityOrder"',
      '--org-name="fake-sfdc-org"',
      '--source="fakeOrgOrderCreated"',
      '--app=my-app',
    ])

    expect(stderr.output).to.equal(heredoc`
      Creating publication highPriorityOrders...
      Creating publication highPriorityOrders... done
    `)
    expect(stdout.output).to.eq('')
  })
})
