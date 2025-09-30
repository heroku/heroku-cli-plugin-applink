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
  sso_response,
  app,
  addonAttachment,
} from '../../helpers/fixtures'
import {CLIError} from '@oclif/core/lib/errors'
import stripAnsi from '../../helpers/strip-ansi'
import heredoc from 'tsheredoc'
import {ux} from '@oclif/core'
import * as sinon from 'sinon'

const stdOutputMockStart = () => {
  stderr.start()
  stdout.start()
}

const stdOutputMockStop = () => {
  stderr.stop()
  stdout.stop()
}

describe('datacloud:disconnect', function () {
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
      sinon.restore()
    })

    it('shows the expected output after failing', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, [])
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(202, connection5_disconnection_failed)

      try {
        await runCommand(Cmd, [
          'myorg',
          '--app=my-app',
          '--confirm=myorg',
        ])
      } catch (error: unknown) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal('Failed')
        expect(oclif.exit).to.equal(1)
      }
    })

    it('waits for DELETE /connections/orgName status to return "disconnecting" before ending the action successfully', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, [])
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
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, [])
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
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, [])
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

    it('prompts with DAT table when data action targets exist (no indent)', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, [
          {
            label: 'Target One',
            api_name: 'TargetOne',
          },
          {
            label: 'Target Two',
            api_name: 'TargetTwo',
          },
        ])
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(202, connection5_disconnecting)

      sinon.stub(ux, 'prompt').resolves('myorg')
      stdOutputMockStart()
      await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
      ])
      stdOutputMockStop()

      expect(stderr.output).to.contain('Destructive action')
      expect(stderr.output).to.contain('Data Action Target Name')
      expect(stderr.output).to.contain('Target One')
      expect(stderr.output).to.contain('Target Two')
    })

    it('prompts without DAT table when no data action targets exist', async function () {
      applinkApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(202, connection5_disconnecting)
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, [])

      sinon.stub(ux, 'prompt').resolves('myorg')
      stdOutputMockStart()
      await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
      ])
      stdOutputMockStop()

      console.log(stderr.output)

      expect(stderr.output).to.contain('Destructive action')
      expect(stderr.output).to.contain('This command disconnects the org myorg')
      expect(stderr.output).to.not.contain('data action targets')
      expect(stderr.output).to.not.contain('Data Action Target Name')
    })
  })
})
