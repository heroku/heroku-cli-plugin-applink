import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/events/publications/info'
import stripAnsi from '../../../helpers/strip-ansi'
import {addon, publication2} from '../../../helpers/fixtures'

describe('events:publications:info', function () {
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

  it('shows info for the publication', async function () {
    eventsApi
      .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/publications/beabd9f6-cf0a-4469-a956-de4d2e4ffda0')
      .reply(200, publication2)

    await runCommand(Cmd, [
      'beabd9f6-cf0a-4469-a956-de4d2e4ffda0',
      '--app',
      'my-app',
    ])

    expect(stripAnsi(stdout.output)).to.equal(heredoc`
      Id:       beabd9f6-cf0a-4469-a956-de4d2e4ffda0
      Name:     fakeOrgAccountCreated
      Platform: webhook
      Url:      https://suscipit-laudantium-ratione-23cc2b95ee13/api/webhooks/fake-sfdc-org
    `)
    expect(stderr.output).to.equal('')
  })
})
