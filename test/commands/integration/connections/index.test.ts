import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/integration/connections/index'
import stripAnsi from '../../../helpers/strip-ansi'
import {
  addon,
  connection1,
  connection2_connected,
} from '../../../helpers/fixtures'

describe('integration:connections', function () {
  let api: nock.Scope
  let integrationApi: nock.Scope
  const {env} = process

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
    integrationApi = nock('https://integration-api.heroku.com')
  })

  afterEach(function () {
    process.env = env
    api.done()
    integrationApi.done()
    nock.cleanAll()
  })

  context('when the --app flag is specified', function () {
    beforeEach(function () {
      api.get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
    })

    context('when there are no Heroku Integration connections created on the app', function () {
      it('displays a notification', async function () {
        integrationApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal('No Heroku Integration connections for app my-app.\n')
        expect(stderr.output).to.equal('')
      })
    })

    context('when there are Heroku Integration connections returned', function () {
      it('shows the connections', async function () {
        integrationApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [connection1, connection2_connected])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku Integration connections for app my-app
  
           Type           Org Name Status    Run As User      
           ────────────── ──────── ───────── ──────────────── 
           Salesforce Org my-org-1 Connected user@example.com 
           Salesforce Org my-org-2 Connected user@example.com 
        `)
        expect(stderr.output).to.equal('')
      })
    })
  })
})
