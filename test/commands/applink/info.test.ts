import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/applink/connections/info'
import stripAnsi from '../../helpers/strip-ansi'
import {
  addon,
  legacyAddon,
  connection2_connected,
  connection_record_not_found,
} from '../../helpers/fixtures'
import {CLIError} from '@oclif/core/lib/errors'

describe('applink:connections:info', function () {
  let api: nock.Scope
  let applinkApi: nock.Scope
  const {env} = process

  context('when config var is set to the HEROKU_APPLINK_API_URL', function () {
    beforeEach(function () {
      process.env = {}
      api = nock('https://api.heroku.com')
        .get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
      applinkApi = nock('https://applink-api.heroku.com')
    })

    afterEach(function () {
      process.env = env
      api.done()
      applinkApi.done()
      nock.cleanAll()
    })

    it('shows info for the connection', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2')
        .reply(200, connection2_connected)

      await runCommand(Cmd, [
        'my-org-2',
        '--app=my-app',
      ])

      expect(stripAnsi(stdout.output)).to.equal(heredoc`
        Id:           5551fe92-c2fb-4ef7-be43-9d927d9a5c53
        Instance URL: https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com
        Org ID:       00DSG000007a3BcA84
        Org Name:     my-org-2
        Run As User:  user@example.com
        Status:       Connected
        Type:         Salesforce Org
      `)
      expect(stderr.output).to.equal('')
    })

    it('connection not found', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2')
        .reply(200, connection_record_not_found)

      try {
        await runCommand(Cmd, [
          'my-org-2',
          '--app=my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.contain('not found or is not connected to')
        expect(oclif.exit).to.equal(1)
      }
    })
  })

  context('when config var is set to the legacy HEROKU_INTEGRATION_API_URL', function () {
    let integrationApi: nock.Scope
    beforeEach(function () {
      process.env = {}
      api = nock('https://api.heroku.com')
        .get('/apps/my-app/addons')
        .reply(200, [legacyAddon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_INTEGRATION_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_INTEGRATION_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
      integrationApi = nock('https://integration-api.heroku.com')
    })

    afterEach(function () {
      process.env = env
      api.done()
      integrationApi.done()
      nock.cleanAll()
    })

    it('shows info for the connection', async function () {
      integrationApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2')
        .reply(200, connection2_connected)

      await runCommand(Cmd, [
        'my-org-2',
        '--app=my-app',
      ])

      expect(stripAnsi(stdout.output)).to.equal(heredoc`
        Id:           5551fe92-c2fb-4ef7-be43-9d927d9a5c53
        Instance URL: https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com
        Org ID:       00DSG000007a3BcA84
        Org Name:     my-org-2
        Run As User:  user@example.com
        Status:       Connected
        Type:         Salesforce Org
      `)
      expect(stderr.output).to.equal('')
    })
  })
})
