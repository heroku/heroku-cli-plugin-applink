import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/events/subscriptions/index'
import stripAnsi from '../../../helpers/strip-ansi'
import {addon, subscription, subscription2} from '../../../helpers/fixtures'

describe('events:subscriptions', function () {
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

  context('when there are no Heroku Events subscriptions', function () {
    it('displays a notification', async function () {
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/subscriptions')
        .reply(200, [])

      await runCommand(Cmd, [
        '--app',
        'my-app',
      ])

      expect(stripAnsi(stdout.output)).to.equal('No Heroku Events subscriptions for app my-app.\n')
      expect(stderr.output).to.equal('')
    })
  })

  context('when there are Heroku Events subscriptions returned', function () {
    it('shows the subscriptions', async function () {
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/subscriptions')
        .reply(200, [subscription, subscription2])

      await runCommand(Cmd, [
        '--app',
        'my-app',
      ])
      expect(stripAnsi(stdout.output)).to.equal(heredoc`
        === Heroku Events subscriptions for app my-app
        
         Name                     Platform   Details                                                                              
         ──────────────────────── ────────── ──────────────────────────────────────────────────────────────────────────────────── 
         herokuEventsSystemStatus generate   Interval: 1m, Mapping: root = {"status": "up", "created_at": timestamp_unix_milli()} 
         fakeOrgAccountChange     salesforce Event: /data/AccountChange, Org Name: fake-sfdc-org                                  
       `)
      expect(stderr.output).to.equal('')
    })
  })

  context('when using the --json flag', function () {
    it('returns the subscriptions in JSON format', async function () {
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/subscriptions')
        .reply(200, [subscription, subscription2])

      await runCommand(Cmd, [
        '--app=my-app',
        '--json',
      ])

      const parsedOutput = JSON.parse(stdout.output)
      expect(parsedOutput[0].name).to.eq(subscription.name)
      expect(parsedOutput[1].name).to.eq(subscription2.name)
      expect(stderr.output).to.equal('')
    })
  })
})
