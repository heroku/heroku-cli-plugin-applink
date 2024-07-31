import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/events/publications/index'
import stripAnsi from '../../../helpers/strip-ansi'
import {addon, publication1, publication2} from '../../../helpers/fixtures'

describe('events:publications', function () {
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

  context('when there are no Heroku Events publications', function () {
    it('displays a notification', async function () {
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/publications')
        .reply(200, [])

      await runCommand(Cmd, [
        '--app',
        'my-app',
      ])

      expect(stripAnsi(stdout.output)).to.equal('No Heroku Events publications for app my-app.\n')
      expect(stderr.output).to.equal('')
    })
  })

  context('when there are Heroku Events publications returned', function () {
    it('shows the publications', async function () {
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/publications')
        .reply(200, [publication1, publication2])

      await runCommand(Cmd, [
        '--app',
        'my-app',
      ])

      expect(stripAnsi(stdout.output)).to.equal(heredoc`
        === Heroku Events publications for app my-app

         Name                    Platform   Details                                                                          
         ─────────────────────── ────────── ──────────────────────────────────────────────────────────────────────────────── 
         hempSystemStatusFakeOrg salesforce Event: /event/Hemp_System_Status__e, Org Name: fake-sfdc-org                     
         fakeOrgAccountCreated   webhook    Url: https://suscipit-laudantium-ratione-23cc2b95ee13/api/webhooks/fake-sfdc-org 
      `)
      expect(stderr.output).to.equal('')
    })
  })

  context('when using the --json flag', function () {
    it('returns the publications in JSON format', async function () {
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/publications')
        .reply(200, [publication1, publication2])

      await runCommand(Cmd, [
        '--app=my-app',
        '--json',
      ])

      const parsedOutput = JSON.parse(stdout.output)
      expect(parsedOutput[0].name).to.eq(publication1.name)
      expect(parsedOutput[1].name).to.eq(publication2.name)
      expect(stderr.output).to.equal('')
    })
  })
})
