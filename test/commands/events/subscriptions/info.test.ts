import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/events/subscriptions/info'
import stripAnsi from '../../../helpers/strip-ansi'
import {addon, subscription2} from '../../../helpers/fixtures'

describe('events:subscriptions:info', function () {
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

  it('shows info for the subscription', async function () {
    eventsApi
      .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/subscriptions/fakeOrgAccountChange')
      .reply(200, subscription2)

    await runCommand(Cmd, [
      'fakeOrgAccountChange',
      '--app=my-app',
    ])

    expect(stripAnsi(stdout.output)).to.equal(heredoc`
      Event:    /data/AccountChange
      Id:       5d25c8a0-28b1-44fc-b6c0-e91fa018a42f
      Name:     fakeOrgAccountChange
      Org Name: fake-sfdc-org
      Platform: salesforce
    `)
    expect(stderr.output).to.equal('')
  })
})
