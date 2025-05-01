import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/datacloud/disconnect'
import {
  addon,
  connection5_disconnecting,
  connection5_disconnection_failed,
  ConnectionError_record_not_found,
  legacyAddon,
} from '../../helpers/fixtures'
import {CLIError} from '@oclif/core/lib/errors'
import stripAnsi from '../../helpers/strip-ansi'
import heredoc from 'tsheredoc'

describe('datacloud:disconnect', function () {
  let api: nock.Scope
  let applinkApi: nock.Scope
  const {env} = process

  context('when config var is set to HEROKU_APPLINK_API_URL', function () {
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

    it('shows the expected output after failing', async function () {
      applinkApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(202, connection5_disconnection_failed)

      try {
        await runCommand(Cmd, [
          'myorg',
          '--app=my-app',
        ])
      } catch (error: unknown) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal('Disconnection Failed')
        expect(oclif.exit).to.equal(1)
      }
    })

    it('waits for DELETE /connections/orgName status to return "disconnecting" before ending the action successfully', async function () {
      applinkApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(202, connection5_disconnecting)

      await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
        '--confirm=myorg',
      ])

      expect(stderr.output).to.contain('Disconnected')
      expect(stdout.output).to.equal('')
    })

    it('connection not found', async function () {
      applinkApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .replyWithError(ConnectionError_record_not_found)

      try {
        await runCommand(Cmd, [
          'myorg',
          '--app=my-app',
          '--confirm=myorg',
        ])
      } catch (error: unknown) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
        Data Cloud org myorg doesn\'t exist on app my-app.
        Use heroku applink:connections to list the connections on the app.`)
        expect(oclif.exit).to.equal(1)
      }
    })

    it('errors when the wrong org name is passed to the confirm flag', async function () {
      try {
        await runCommand(Cmd, [
          'myorg',
          '--app=my-app',
          '--confirm=myorg2',
        ])
      } catch (error: unknown) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal('Confirmation myorg2 did not match myorg. Aborted.')
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

    it('waits for DELETE /connections/orgName status to return "disconnecting" before ending the action successfully', async function () {
      integrationApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(202, connection5_disconnecting)

      await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
        '--confirm=myorg',
      ])

      expect(stderr.output).to.contain('Disconnected')
      expect(stdout.output).to.equal('')
    })
  })
})
