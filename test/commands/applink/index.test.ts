import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/applink/connections/index'
import stripAnsi from '../../helpers/strip-ansi'
import {
  addon,
  addon2,
  connection1,
  connection2_connected,
  connection3,
  connection4_connected,
} from '../../helpers/fixtures'

describe('applink:connections', function () {
  let api: nock.Scope
  let applinkApi: nock.Scope
  let applinkApi: nock.Scope
  const {env} = process

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
    applinkApi = nock('https://applink-api.heroku.com')
  })

  afterEach(function () {
    process.env = env
    api.done()
    applinkApi.done()
    nock.cleanAll()
  })

  context('when the --app flag is specified', function () {
    beforeEach(function () {
      api.get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
    })

    context('when there are no Heroku AppLink connections created on the app', function () {
      it('displays a notification', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal('No Heroku AppLink connections for app my-app.\n')
        expect(stderr.output).to.equal('')
      })
    })

    context('when there are Heroku AppLink connections returned', function () {
      it('shows the connections', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [connection1, connection2_connected])

        await runCommand(Cmd, [
          '--app=my-app',
        ])

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku AppLink connections for app my-app
  
           Type           Org Name Status    Run As User      
           ────────────── ──────── ───────── ──────────────── 
           Salesforce Org my-org-1 Connected user@example.com 
           Salesforce Org my-org-2 Connected user@example.com 
        `)
        expect(stderr.output).to.equal('')
      })
    })
  })

  context('when the --app flag is not specified', function () {
    context('when there are no Heroku AppLink addons', function () {
      beforeEach(function () {
        api.get('/addons').reply(200, [])
      })

      it('displays a notification', async function () {
        await runCommand(Cmd)

        expect(stripAnsi(stdout.output)).to.equal('No Heroku AppLink connections.\n')
        expect(stderr.output).to.equal('')
      })
    })

    context('when there are Heroku AppLink addons', function () {
      beforeEach(function () {
        api.get('/addons')
          .reply(200, [addon, addon2])
          .get('/apps/89abcdef-0123-4567-89ab-cdef01234567/config-vars')
          .reply(200, {
            HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
            HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
          })
          .get('/apps/abcdef01-2345-6789-abcd-ef0123456789/config-vars')
          .reply(200, {
            HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/6789abcd-ef01-2345-6789-abcdef012345',
            HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
          })
      })

      it('displays a notification when there are no Heroku AppLink connections on any app', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [])
          .get('/addons/6789abcd-ef01-2345-6789-abcdef012345/connections')
          .reply(200, [])

        await runCommand(Cmd)

        expect(stripAnsi(stdout.output)).to.equal('No Heroku AppLink connections.\n')
        expect(stderr.output).to.equal('')
      })

      it('shows the connections when there are Heroku AppLink connections returned', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [connection1, connection2_connected])
          .get('/addons/6789abcd-ef01-2345-6789-abcdef012345/connections')
          .reply(200, [connection3, connection4_connected])

        await runCommand(Cmd)

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku AppLink connections

           App          Type           Org Name Status     Run As User       
           ──────────── ────────────── ──────── ────────── ───────────────── 
           my-app       Salesforce Org my-org-1 Connected  user@example.com  
           my-app       Salesforce Org my-org-2 Connected  user@example.com  
           my-other-app Salesforce Org my-org-1 Connecting user2@example.com 
           my-other-app Data Cloud Org my-org-2 Connected  user@example.com  
        `)
        expect(stderr.output).to.equal('')
      })
    })

    context('when there are Heroku AppLink addons returned with the legacy applink API URL config var', function () {
      beforeEach(function () {
        applinkApi = nock('https://applink-api.heroku.com')
        api.get('/addons')
          .reply(200, [addon, addon2])
          .get('/apps/89abcdef-0123-4567-89ab-cdef01234567/config-vars')
          .reply(200, {
            HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          })
          .get('/apps/abcdef01-2345-6789-abcd-ef0123456789/config-vars')
          .reply(200, {
            HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/6789abcd-ef01-2345-6789-abcdef012345',
          })
      })

      it('shows the connections when there are Heroku AppLink connections returned', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [connection1, connection2_connected])
          .get('/addons/6789abcd-ef01-2345-6789-abcdef012345/connections')
          .reply(200, [connection3, connection4_connected])

        await runCommand(Cmd)

        expect(stripAnsi(stdout.output)).to.equal(heredoc`
          === Heroku AppLink connections

           App          Type           Org Name Status     Run As User       
           ──────────── ────────────── ──────── ────────── ───────────────── 
           my-app       Salesforce Org my-org-1 Connected  user@example.com  
           my-app       Salesforce Org my-org-2 Connected  user@example.com  
           my-other-app Salesforce Org my-org-1 Connecting user2@example.com 
           my-other-app Data Cloud Org my-org-2 Connected  user@example.com  
        `)
        expect(stderr.output).to.equal('')
      })
    })
  })
})
