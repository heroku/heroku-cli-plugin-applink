import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/salesforce/disconnect'
import {
  addon,
  connection5_disconnecting,
  ConnectionError_record_not_found,
  sso_response,
  app,
  addonAttachment,
} from '../../helpers/fixtures'
import {CLIError} from '@oclif/core/lib/errors'
import stripAnsi from '../../helpers/strip-ansi'

describe('salesforce:disconnect', function () {
  let api: nock.Scope
  let applinkApi: nock.Scope
  const {env} = process

  context('when config var is set to HEROKU_APPLINK_API_URL', function () {
    beforeEach(function () {
      process.env = {}
      api = nock('https://api.heroku.com')
        .get('/apps/my-app')
        .reply(200, app)
        .get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/addon-attachments')
        .reply(200, [addonAttachment])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: 'token',
        })
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response)
      applinkApi = nock('https://applink-api.heroku.com')
    })

    afterEach(function () {
      process.env = env
      api.done()
      applinkApi.done()
      nock.cleanAll()
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
        expect(stripAnsi(message)).to.contain('Salesforce connection myorg doesn\'t exist on app my-app.')
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
        expect(stripAnsi(message)).to.equal('Confirmation myorg2 doesn\'t match myorg. Re-run this command to try again.')
        expect(oclif.exit).to.equal(1)
      }
    })
  })
})
