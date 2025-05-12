import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/applink/authorizations/info'
import stripAnsi from '../../../helpers/strip-ansi'
import {
  addon,
  authorization_connected,
  authorization_not_found,
  sso_response,
} from '../../../helpers/fixtures'
import {CLIError} from '@oclif/core/lib/errors'

describe('applink:authorizations:info', function () {
  let api: nock.Scope
  let integrationApi: nock.Scope
  const {env} = process

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
      .get('/apps/my-app/addons')
      .reply(200, [addon])
      .get('/apps/my-app/config-vars')
      .reply(200, {
        HEROKU_APPLINK_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
        HEROKU_APPLINK_TOKEN: 'token',
      })
      .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
      .reply(200, sso_response)
    integrationApi = nock('https://integration-api.heroku.com')
  })

  afterEach(function () {
    process.env = env
    api.done()
    integrationApi.done()
    nock.cleanAll()
  })

  it('shows info for the authorization', async function () {
    integrationApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/my-developer-name')
      .reply(200, authorization_connected)

    await runCommand(Cmd, [
      'my-developer-name',
      '--app=my-app',
    ])

    expect(stripAnsi(stdout.output)).to.equal(heredoc`
      Add-on:           heroku-applink-vertical-01234
      App:              my-app
      Created By:       user@example.com
      Created Date:     2021-01-01T00:00:00Z
      Developer Name:   my-developer-name
      ID:               5551fe92-c2fb-4ef7-be43-9d927d9a5c53
      Instance URL:     https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com
      Last Modified:    2021-01-01T00:00:00Z
      Last Modified By: user@example.com
      Org ID:           00DSG000007a3BcA84
      Status:           Connected
      Type:             Salesforce Org
    `)
    expect(stderr.output).to.equal('')
  })

  it('connection not found', async function () {
    integrationApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/my-developer-name')
      .reply(200, authorization_not_found)

    try {
      await runCommand(Cmd, [
        'my-developer-name',
        '--app=my-app',
      ])
    } catch (error) {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.contain('not found or is not connected to')
      expect(oclif.exit).to.equal(1)
    }
  })
})
