import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/events/authorizations/index'
import stripAnsi from '../../../helpers/strip-ansi'
import {addon, authorization1, authorization2} from '../../../helpers/fixtures'

describe('events:authorizations', function () {
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

  context('when there are no Heroku Events authorizations', function () {
    it('displays a notification', async function () {
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/authorizations')
        .reply(200, [])

      await runCommand(Cmd, [
        '--app',
        'my-app',
      ])

      expect(stripAnsi(stdout.output)).to.equal('No Heroku Events authorizations for app my-app.\n')
      expect(stderr.output).to.equal('')
    })
  })

  context('when there are Heroku Events authorizations returned', function () {
    it('shows the authorizations', async function () {
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/authorizations')
        .reply(200, [authorization1, authorization2])

      await runCommand(Cmd, [
        '--app',
        'my-app',
      ])

      expect(stripAnsi(stdout.output)).to.equal(heredoc`
        === Heroku Events authorizations for app my-app

         ID                                   Platform   Details 
         ──────────────────────────────────── ────────── ─────── 
         01234567-89ab-cdef-0123-456789abcdef salesforce TBD     
         456789ab-cdef-0123-4567-89abcdef0123 salesforce TBD     
      `)
      expect(stderr.output).to.equal('')
    })
  })
})
