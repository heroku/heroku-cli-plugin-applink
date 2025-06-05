import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/applink/connections'
import stripAnsi from '../../../helpers/strip-ansi'
import {
  addon,
  connection1,
  connection2_connected,
  connection3_connected_failed,
  sso_response,
} from '../../../helpers/fixtures'

describe('applink:connections', function () {
  let api: nock.Scope
  let applinkApi: nock.Scope
  const {env} = process

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
    applinkApi = nock('https://applink-api.heroku.com')
  })

  afterEach(function () {
    process.env = env
    api.done()
    applinkApi.done()
    nock.cleanAll()
  })

  context('when the --app flag is specified', function () {
    beforeEach(function () {
      api.get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: 'token',
        })
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response)
    })

    context('when there are no Heroku AppLink connections created on the app', function () {
      it('displays a notification', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal('There are no Heroku AppLink connections for app my-app.\n')
        expect(stderr.output).to.equal('')
      })
    })

    context('when there are Heroku AppLink connections returned', function () {
      it('shows the connections', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [connection1, connection2_connected])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku AppLink connections for add-on heroku-applink-vertical-01234 on app my-app
        
           Add-On                        Type           Connection Name Status    
           ───────────────────────────── ────────────── ─────────────── ───────── 
           heroku-applink-vertical-01234 Salesforce Org my-org-1        Connected 
           heroku-applink-vertical-01234 Salesforce Org my-org-2        Connected 
        `)
        expect(stderr.output).to.equal('')
      })
    })

    context('when Heroku AppLink connections fails to load', function () {
      it('shows failed connection and warning message', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [connection1, connection2_connected, connection3_connected_failed])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku AppLink connections for add-on heroku-applink-vertical-01234 on app my-app
        
           Add-On                        Type           Connection Name Status    
           ───────────────────────────── ────────────── ─────────────── ───────── 
           heroku-applink-vertical-01234 Salesforce Org my-org-1        Connected 
           heroku-applink-vertical-01234 Salesforce Org my-org-2        Connected 
           heroku-applink-vertical-01234 Salesforce Org my-org-3        Failed    

          You have one or more failed connections. For more information on how to fix connections, see https://devcenter.heroku.com/articles/heroku-applink#connection-statuses.
        `)
        expect(stderr.output).to.equal('')
      })
    })
  })
})
