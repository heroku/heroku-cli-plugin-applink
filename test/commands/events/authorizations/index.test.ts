import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/events/authorizations/index'
import stripAnsi from '../../../helpers/strip-ansi'

describe('events:authorizations', function () {
  let api: nock.Scope
  let eventsApi: nock.Scope
  const {env} = process
  const addon = {
    name: 'herokuevents-horizontal-01234',
    addon_service: {
      id: '01234567-89ab-cdef-0123-456789abcdef',
      name: 'herokuevents',
    },
  }

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
        .reply(200, [
          {
            id: '01234567-89ab-cdef-0123-456789abcdef',
            params: {
              org_name: 'example-org',
              url: 'https://example-org.my.salesforce.com',
            },
            platform: 'salesforce',
          },
          {
            id: '12345678-9abc-def0-1234-56789abcdef0',
            params: {
              org_name: 'another-org',
              url: 'https://another-org.my.salesforce.com',
            },
            platform: 'salesforce',
          },
        ])

      await runCommand(Cmd, [
        '--app',
        'my-app',
      ])

      expect(stripAnsi(stdout.output)).to.equal(heredoc`
        === Heroku Events authorizations for app my-app

         ID                                   Platform   Details 
         ──────────────────────────────────── ────────── ─────── 
         01234567-89ab-cdef-0123-456789abcdef salesforce TBD     
         12345678-9abc-def0-1234-56789abcdef0 salesforce TBD     
      `)
      expect(stderr.output).to.equal('')
    })
  })
})
