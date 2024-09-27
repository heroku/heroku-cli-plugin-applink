import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/salesforce/disconnect'
import {
  addon,
  connection5_disconnecting,
} from '../../helpers/fixtures'

describe('salesforce:disconnect', function () {
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
})
