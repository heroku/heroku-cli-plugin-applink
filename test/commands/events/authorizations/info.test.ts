import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/events/authorizations/info'
import stripAnsi from '../../../helpers/strip-ansi'
import {addon, authorization2} from '../../../helpers/fixtures'

describe('events:authorizations:info', function () {
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

  it('shows info for the authorization', async function () {
    eventsApi
      .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/authorizations/456789ab-cdef-0123-4567-89abcdef0123')
      .reply(200, authorization2)

    await runCommand(Cmd, [
      '456789ab-cdef-0123-4567-89abcdef0123',
      '--app',
      'my-app',
    ])

    expect(stripAnsi(stdout.output)).to.equal(heredoc`
      Id:       456789ab-cdef-0123-4567-89abcdef0123
      Org Name: fake-sfdc-org
      Platform: salesforce
      Url:      https://fake-sfdc-org.my.salesforce.com
    `)
    expect(stderr.output).to.equal('')
  })
})
