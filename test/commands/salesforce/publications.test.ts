import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/salesforce/publications'
import stripAnsi from '../../helpers/strip-ansi'
import {
  addon,
  authorization_connected,
  authorization_connected_2,
  sso_response,
} from '../../helpers/fixtures'
import {CLIError} from "@oclif/core/lib/errors";

describe('salesforce:publications', function () {
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

    it('when there are no Heroku AppLink connections on the app it displays an error', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, [])

      await runCommand(Cmd, [
        '--app=my-app',
      ]).catch(error => {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal('There are no Heroku AppLink connections for my-app.')
        expect(oclif.exit).to.equal(1)
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
