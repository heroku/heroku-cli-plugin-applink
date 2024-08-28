import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/integration/connections/index'
import stripAnsi from '../../../helpers/strip-ansi'
import {addon, addon2, connection1, connection2_connected, connection3} from '../../../helpers/fixtures'

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
          HEROKU_INTEGRATION_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
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
          '--app',
          'my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku Integration connections for app my-app
  
           Type           Org Name State     Run As User      
           ────────────── ──────── ───────── ──────────────── 
           Salesforce Org my-org-1 Connected user@example.com 
           Salesforce Org my-org-2 Connected user@example.com 
        `)
        expect(stderr.output).to.equal('')
      })
    })
  })

  context('when the --app flag isn’t specified', function () {
    context('when there are no Heroku Integration addons', function () {
      beforeEach(function () {
        api.get('/addons').reply(200, [])
      })

      it('displays a notification', async function () {
        await runCommand(Cmd)

        expect(stripAnsi(stdout.output)).to.equal('No Heroku Integration connections.\n')
        expect(stderr.output).to.equal('')
      })
    })

    context('when there are Heroku Integration addons', function () {
      beforeEach(function () {
        api.get('/addons')
          .reply(200, [addon, addon2])
          .get('/apps/89abcdef-0123-4567-89ab-cdef01234567/config-vars')
          .reply(200, {
            HEROKU_INTEGRATION_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          })
          .get('/apps/abcdef01-2345-6789-abcd-ef0123456789/config-vars')
          .reply(200, {
            HEROKU_INTEGRATION_API_URL: 'https://integration-api.heroku.com/addons/6789abcd-ef01-2345-6789-abcdef012345',
          })
      })

      it('displays a notification when there are no Heroku Integration connections on any app', async function () {
        integrationApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [])
          .get('/addons/6789abcd-ef01-2345-6789-abcdef012345/connections')
          .reply(200, [])

        await runCommand(Cmd)

        expect(stripAnsi(stdout.output)).to.equal('No Heroku Integration connections.\n')
        expect(stderr.output).to.equal('')
      })

      it('shows the connections when there are Heroku Integration connections returned', async function () {
        integrationApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [connection1, connection2_connected])
          .get('/addons/6789abcd-ef01-2345-6789-abcdef012345/connections')
          .reply(200, [connection3])

        await runCommand(Cmd)

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku Integration connections

           App          Type           Org Name State      Run As User       
           ──────────── ────────────── ──────── ────────── ───────────────── 
           my-app       Salesforce Org my-org-1 Connected  user@example.com  
           my-app       Salesforce Org my-org-2 Connected  user@example.com  
           my-other-app Datacloud Org  my-org-1 Connecting user2@example.com 
        `)
        expect(stderr.output).to.equal('')
      })
    })
  })
})
