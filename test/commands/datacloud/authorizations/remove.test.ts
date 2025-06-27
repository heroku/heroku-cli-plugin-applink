import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/datacloud/authorizations/remove'
import {
  addon,
  sso_response,
  app,
} from '../../../helpers/fixtures'
import stripAnsi from '../../../helpers/strip-ansi'

describe('datacloud:authorizations:remove', function () {
  let api: nock.Scope
  let applinkApi: nock.Scope
  const {env} = process

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
      .get('/apps/my-app')
      .reply(200, app)
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
    process.env = env
    api.done()
    applinkApi.done()
    nock.cleanAll()
  })

  it('successfully removes a Data Cloud authorization from a Heroku app', async function () {
    applinkApi
      .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/my-auth-1')
      .reply(204, [])

    await runCommand(Cmd, [
      'my-auth-1',
      '--app=my-app',
      '--addon=heroku-applink-vertical-01234',
      '--confirm=my-auth-1',
    ])

    expect(stdout.output).to.eq('')
    expect(stripAnsi(stderr.output)).to.contain('Removing credentials authorization my-auth-1 from my-app')
  })
})
