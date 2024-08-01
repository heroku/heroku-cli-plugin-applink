import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../../run-command'
import Cmd from '../../../../../src/commands/events/publications/webhook/create'
import {addon, publication2} from '../../../../helpers/fixtures'

describe('events:publications:webhook:create', function () {
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

  it('creates a webhook URL publication target', async function () {
    eventsApi
      .post('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/platforms/webhook/publications')
      .reply(200, publication2)

    await runCommand(Cmd, [
      'fakeOrgAccountCreated',
      "--filter='root = if ChangeEventHeader.ChangeType == \"CREATE\" { this } else { deleted() }'",
      '--source="fakeOrgAccountChange"',
      '--token="c858f97f-0723-4077-bd79-f895f8d9ffec"',
      '--url="https://suscipit-laudantium-ratione-23cc2b95ee13/api/webhooks/fake-sfdc-org"',
      '--app=my-app',
    ])

    expect(stderr.output).to.equal(heredoc`
      Creating publication fakeOrgAccountCreated...
      Creating publication fakeOrgAccountCreated... done
    `)
    expect(stdout.output).to.eq('')
  })
})
