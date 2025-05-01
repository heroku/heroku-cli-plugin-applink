import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/applink/authorizations/index'
import stripAnsi from '../../../helpers/strip-ansi'
import {
  addon,
  authorization_connected,
  authorization_connected_2,
} from '../../../helpers/fixtures'

describe('applink:authorizations', function () {
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
          HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
    })

    context('when there are no Heroku AppLink authorizations created on the app', function () {
      it('displays a notification', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations')
          .reply(200, [])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal('There are no Heroku AppLink authorizations for add-on heroku-applink-vertical-01234 on app my-app.\n')
        expect(stderr.output).to.equal('')
      })
    })

    context('when there are Heroku AppLink authorizations returned', function () {
      it('shows the authorizations', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations')
          .reply(200, [authorization_connected, authorization_connected_2])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku AppLink authorizations for app my-app
  
           Type           Add-On                        Connected Org Developer Name    Status    
           ────────────── ───────────────────────────── ───────────── ───────────────── ───────── 
           Salesforce Org heroku-applink-vertical-01234 my-org-1      my-developer-name Connected 
           Salesforce Org heroku-applink-vertical-01234 my-org-2      my-developer-name Connected 
        `)
        expect(stderr.output).to.equal('')
      })
    })
  })
})
