import nock from 'nock'
import stripAnsi from '../../../helpers/strip-ansi'
import heredoc from 'tsheredoc'
import {stderr} from 'stdout-stderr'
import {expect} from 'chai'
import Cmd from '../../../../src/commands/salesforce/connect/jwt'
import {runCommand} from '../../../run-command'
import {
  addon,
  sso_response,
  credential_id_connected,
  credential_id_failed,
} from '../../../helpers/fixtures'

describe('salesforce:connect:jwt', function () {
  let applinkApi: nock.Scope
  let api: nock.Scope

  const filePath = `${__dirname}/../../../helpers/jwt.key`

  beforeEach(function () {
    api = nock('https://api.heroku.com')
      .get('/apps/my-app/addons')
      .reply(200, [addon])
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
    api.done()
    applinkApi.done()
    nock.cleanAll()
  })

  it('when the connection succeeds, it shows the expected output', async function () {
    applinkApi
      .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/jwt')
      .reply(202, credential_id_connected)

    await runCommand(Cmd, [
      'my-connection-1',
      '--app=my-app',
      '--client-id=test-id',
      `--jwt-key-file=${filePath}`,
      '--username=test-username',
      '-l https://test.salesforce.com',
    ])

    expect(stripAnsi(stderr.output)).to.eq(heredoc`
      Adding credentials for test-username to my-app as my-connection-1...
      Adding credentials for test-username to my-app as my-connection-1... Connected
    `)
  })

  it('when the connection status is not "Connected", it shows the correct connection status in the output', async function () {
    applinkApi
      .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/jwt')
      .reply(202, credential_id_failed)

    await runCommand(Cmd, [
      'my-connection-1',
      '--app=my-app',
      '--client-id=test-id',
      `--jwt-key-file=${filePath}`,
      '--username=test-username',
      '-l https://test.salesforce.com',
    ])

    expect(stripAnsi(stderr.output)).to.eq(heredoc`
      Adding credentials for test-username to my-app as my-connection-1...
      Adding credentials for test-username to my-app as my-connection-1... Failed
    `)
  })
})
