import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/events/generate'
import {addon, subscription} from '../../helpers/fixtures'

describe('events:generate', function () {
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

  it('creates an event generator', async function () {
    eventsApi
      .post('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/platforms/generate/subscriptions')
      .reply(200, subscription)

    await runCommand(Cmd, [
      'herokuEventsSystemStatus',
      '--interval="1m"',
      "--mapping='root = {\"status\": \"up\", \"created_at\": timestamp_unix_milli()}'",
      '--target="hempSystemStatusFakeOrg"',
      '--app=my-app',
    ])

    expect(stderr.output).to.equal(heredoc`
      Creating event generator herokuEventsSystemStatus...
      Creating event generator herokuEventsSystemStatus... done
    `)
    expect(stdout.output).to.eq('')
  })
})
