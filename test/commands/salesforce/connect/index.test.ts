import {ux} from '@oclif/core'
import {expect} from 'chai'
import nock from 'nock'
import {ChildProcess} from 'node:child_process'
import sinon, {SinonSandbox, SinonStub} from 'sinon'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/salesforce/connect'
import {
  addon,
  connection2_connected,
  connection2_connecting,
  connection2_disconnected,
  connection2_failed,
  sso_response,
} from '../../../helpers/fixtures'
import stripAnsi from '../../../helpers/strip-ansi'
import {CLIError} from '@oclif/core/lib/errors'

describe('salesforce:connect', function () {
  let api: nock.Scope
  const {env} = process
  let sandbox: SinonSandbox
  let urlOpener: SinonStub

  context('when config var is set to HEROKU_APPLINK_API_URL', function () {
    let applinkApi: nock.Scope

    beforeEach(function () {
      process.env = {}
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
      sandbox = sinon.createSandbox()
    })

    afterEach(function () {
      process.env = env
      api.done()
      applinkApi.done()
      nock.cleanAll()
      sandbox.restore()
    })

    context('when the user accepts the prompt to open the browser', function () {
      beforeEach(function () {
        urlOpener = sandbox.stub(Cmd, 'urlOpener').onFirstCall().resolves({
          on(_: string, _cb: (_err: Error) => void) {},
        } as unknown as ChildProcess)
        sandbox.stub(ux, 'anykey').onFirstCall().resolves()
        applinkApi
          .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce')
          .reply(202, connection2_connecting)
      })

      context('when the connection succeeds', function () {
        beforeEach(function () {
          applinkApi
            .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/5551fe92-c2fb-4ef7-be43-9d927d9a5c53')
            .reply(200, connection2_connected)
        })

        it('shows the URL that will be opened for the OAuth flow', async function () {
          await runCommand(Cmd, [
            'my-org-2',
            '--app=my-app',
          ])

          expect(stderr.output).to.contain(`Opening browser to ${connection2_connecting.redirect_uri}`)
        })

        it('attempts to open the browser to the redirect URI', async function () {
          await runCommand(Cmd, [
            'my-org-2',
            '--app=my-app',
          ])

          expect(urlOpener.calledWith(connection2_connecting.redirect_uri, {wait: false})).to.equal(true)
        })

        it('shows the expected output after connecting', async function () {
          await runCommand(Cmd, [
            'my-org-2',
            '--app=my-app',
          ])

          expect(stripAnsi(stderr.output)).to.eq(heredoc`
            Opening browser to https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize
            Connecting Salesforce org to my-app as my-org-2...
            Connecting Salesforce org to my-app as my-org-2... Connected
          `)
          expect(stdout.output).to.eq('')
        })
      })

      context('when the connection fails', function () {
        it('shows the expected output after failing when an error description is included', async function () {
          applinkApi
            .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/5551fe92-c2fb-4ef7-be43-9d927d9a5c53')
            .reply(200, connection2_failed)

          try {
            await runCommand(Cmd, [
              'my-org-2',
              '--app=my-app',
            ])
          } catch (error: unknown) {
            const {message, oclif} = error as CLIError
            expect(stripAnsi(message)).to.equal(heredoc`
              org_connection_failed
              There was a problem connecting your org. Try again later.
            `)
            expect(oclif.exit).to.equal(1)
          }

          expect(stdout.output).to.eq('')
        })

        it('shows the expected output after failing when no error description is included', async function () {
          applinkApi
            .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/5551fe92-c2fb-4ef7-be43-9d927d9a5c53')
            .reply(200, connection2_disconnected)

          try {
            await runCommand(Cmd, [
              'my-org-2',
              '--app=my-app',
            ])
          } catch (error: unknown) {
            const {message, oclif} = error as CLIError
            expect(stripAnsi(message)).to.equal('Disconnected')
            expect(oclif.exit).to.equal(1)
          }

          expect(stdout.output).to.eq('')
        })
      })
    })

    context('when the user rejects the prompt to open the browser', function () {
      beforeEach(function () {
        urlOpener = sandbox.stub(Cmd, 'urlOpener')
        sandbox.stub(ux, 'anykey').onFirstCall().rejects(new Error('quit'))
        applinkApi
          .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce')
          .reply(202, connection2_connecting)
      })

      it("doesn't attempt to open the browser to the redirect URI", async function () {
        try {
          await runCommand(Cmd, [
            'my-org-2',
            '--app=my-app',
          ])
        } catch {}

        expect(urlOpener.notCalled).to.equal(true)
      })
    })
  })
})
