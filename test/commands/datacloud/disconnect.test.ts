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
} from '../../helpers/fixtures'
import {CLIError} from '@oclif/core/lib/errors'
import stripAnsi from '../../helpers/strip-ansi'

describe('datacloud:disconnect', function () {
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
        HEROKU_INTEGRATION_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
      })
    integrationApi = nock('https://integration-api.heroku.com')
  })

  afterEach(function () {
    process.env = env
    api.done()
    integrationApi.done()
    nock.cleanAll()
  })

  it('shows the expected output after failing', async function () {
    integrationApi
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
    integrationApi
      .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
      .reply(202, connection5_disconnecting)

    await runCommand(Cmd, [
      'myorg',
      '--app=my-app',
    ])

    expect(stderr.output).to.contain('Disconnected')
    expect(stdout.output).to.equal('')
  })

  it('connection not found', async function () {
    integrationApi
      .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
      .replyWithError(ConnectionError_record_not_found)

    try {
      await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
      ])
    } catch (error: unknown) {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.equal('Data Cloud org myorg doesn\'t exist on app my-app. Use heroku applink:connections to list the connections on the app.')
      expect(oclif.exit).to.equal(1)
    }
  })
})
