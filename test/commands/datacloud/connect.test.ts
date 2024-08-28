import {ux} from '@oclif/core'
import {expect} from 'chai'
import nock from 'nock'
import {ChildProcess} from 'node:child_process'
import sinon, {SinonSandbox, SinonStub} from 'sinon'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/datacloud/connect'
import {addon, connection4_connected, connection4_connecting, connection4_disconnected, connection4_failed} from '../../helpers/fixtures'
import stripAnsi from '../../helpers/strip-ansi'
import {CLIError} from '@oclif/core/lib/errors'

describe('datacloud:connect', function () {
  let api: nock.Scope
  let integrationApi: nock.Scope
  const {env} = process
  let sandbox: SinonSandbox
  let urlOpener: SinonStub

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
    sandbox = sinon.createSandbox()
  })

  afterEach(function () {
    process.env = env
    api.done()
    integrationApi.done()
    nock.cleanAll()
    sandbox.restore()
  })

  context('when the user accepts the prompt to open the browser', function () {
    beforeEach(function () {
      urlOpener = sandbox.stub(Cmd, 'urlOpener').onFirstCall().resolves({
        on: (_: string, _cb: ErrorCallback) => {},
      } as unknown as ChildProcess)
      sandbox.stub(ux, 'anykey').onFirstCall().resolves()
      integrationApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud')
        .reply(202, connection4_connecting)
    })

    context('when the connection succeeds', function () {
      beforeEach(function () {
        integrationApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2')
          .reply(200, connection4_connected)
      })

      it('shows the URL that will be opened for the OAuth flow', async function () {
        await runCommand(Cmd, [
          'my-org-2',
          '--app=my-app',
        ])

        expect(stderr.output).to.contain(`Opening browser to ${connection4_connecting.redirect_uri}`)
      })

      it('attempts to open the browser to the redirect URI', async function () {
        await runCommand(Cmd, [
          'my-org-2',
          '--app=my-app',
        ])

        expect(urlOpener.calledWith(connection4_connecting.redirect_uri, {wait: false})).to.equal(true)
      })

      it('shows the expected output after connecting', async function () {
        await runCommand(Cmd, [
          'my-org-2',
          '--app=my-app',
        ])

        expect(stripAnsi(stderr.output)).to.eq(heredoc`
          Opening browser to https://login.test1.my.pc-rnd.salesforce.com/services/oauth2/authorize
          Connecting my-app to my-org-2...
          Connecting my-app to my-org-2... done
        `)
        expect(stdout.output).to.eq('')
      })
    })

    context('when the connection fails', function () {
      it('shows the expected output after failing when an error description is included', async function () {
        integrationApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2')
          .reply(200, connection4_failed)

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
        integrationApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2')
          .reply(200, connection4_disconnected)

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
      integrationApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud')
        .reply(202, connection4_connecting)
    })

    it('doesn’t attempt to open the browser to the redirect URI', async function () {
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
