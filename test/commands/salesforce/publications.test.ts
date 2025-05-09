import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/salesforce/publications'
import stripAnsi from '../../helpers/strip-ansi'
import {
  addon,
  connection1,
  connection2_connected,
  connection2_connecting,
  connection2_failed,
  publication1,
  publication2,
  sso_response,
} from '../../helpers/fixtures'
import {CLIError} from '@oclif/core/lib/errors'

describe('salesforce:publications', function () {
  let api: nock.Scope
  let applinkApi: nock.Scope
  const {env} = process

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
    applinkApi = nock('https://applink-api.heroku.com')

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

  afterEach(function () {
    process.env = env
    api.done()
    applinkApi.done()
    nock.cleanAll()
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

  it('when there are no active Heroku AppLink connections on the app it displays an error', async function () {
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
      .reply(200, [connection2_connecting, connection2_failed])

    await runCommand(Cmd, [
      '--app=my-app',
    ]).catch(error => {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.equal('There are no active Heroku AppLink connections for my-app.')
      expect(oclif.exit).to.equal(1)
    })
  })

  it('when the app has not been published to a Salesforce org it returns an error', async function () {
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
      .reply(200, [connection1, connection2_connected])
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-1/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, [])
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-2/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, [])

    await runCommand(Cmd, [
      '--app=my-app',
    ]).catch(error => {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.equal('There are no active Heroku AppLink connections for my-app.')
      expect(oclif.exit).to.equal(1)
    })
  })

  it('when the app has been published to active Salesforce connections it prints a table with publication details', async function () {
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
      .reply(200, [connection1, connection2_connected])
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-1/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, [publication1])
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-2/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, [publication2])

    await runCommand(Cmd, [
      '--app=my-app',
    ])

    expect(stripAnsi(stdout.output)).to.equal(heredoc`
      === Heroku AppLink authorizations for app my-app

       Connection Name Org ID             Created Date         Created By       Last Modified        Last Modified By 
       ─────────────── ────────────────── ──────────────────── ──────────────── ──────────────────── ──────────────── 
       connection1     00DSG000007a3BcA84 2021-01-01T00:00:00Z user@example.com 2021-01-01T00:00:00Z user@example.com 
       connection2     00DSG000007a3BcA84 2021-01-01T00:00:00Z user@example.com 2021-01-01T00:00:00Z user@example.com 
    `)
    expect(stderr.output).to.equal('')
  })
})

