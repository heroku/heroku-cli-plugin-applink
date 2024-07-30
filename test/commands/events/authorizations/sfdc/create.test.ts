import {ux} from '@oclif/core'
import {expect} from 'chai'
import nock from 'nock'
import {ChildProcess} from 'node:child_process'
import sinon, {SinonSandbox, SinonStub} from 'sinon'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../../../run-command'
import Cmd from '../../../../../src/commands/events/authorizations/sfdc/create'
import stripAnsi from '../../../../helpers/strip-ansi'
import {CLIError} from '@oclif/core/lib/errors'

describe('events:authorizations:sfdc:create', function () {
  let api: nock.Scope
  let eventsApi: nock.Scope
  const {env} = process
  const addon = {
    name: 'herokuevents-horizontal-01234',
    addon_service: {
      id: '01234567-89ab-cdef-0123-456789abcdef',
      name: 'herokuevents',
    },
  }
  const authorization = {
    extra: {
      redirect_uri: 'https://fake-sfdc-org.my.salesforce.com/services/oauth2',
    },
    id: '456789ab-cdef-0123-4567-89abcdef0123',
    params: {
      org_name: 'fake-sfdc-org',
      url: null,
    },
    platform: 'salesforce',
  }
  let sandbox: SinonSandbox
  let urlOpener: SinonStub

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
      .get('/apps/my-app/addons')
      .reply(200, [addon])
      .get('/apps/my-app/config-vars')
      .reply(200, {
        HEROKUEVENTS_API_URL: 'https://events-api.heroku.com/v1/tenants/01234567-89ab-cdef-0123-456789abcdef',
      })
    eventsApi = nock('https://events-api.heroku.com')
    sandbox = sinon.createSandbox()
  })

  afterEach(function () {
    process.env = env
    api.done()
    eventsApi.done()
    nock.cleanAll()
    sandbox.restore()
  })

  context('when the users accepts the prompt to open the browser', function () {
    beforeEach(function () {
      urlOpener = sandbox.stub(Cmd, 'urlOpener').onFirstCall().resolves({
        on: (_: string, _cb: ErrorCallback) => {},
      } as unknown as ChildProcess)
      sandbox.stub(ux, 'anykey').onFirstCall().resolves()
      eventsApi
        .post('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/platforms/salesforce/authorizations')
        .reply(200, authorization)
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/authorizations/456789ab-cdef-0123-4567-89abcdef0123')
        .reply(200, {
          ...authorization,
          extra: null,
          params: {org_name: 'fake-sfdc-org', url: 'https://fake-sfdc-org.my.salesforce.com'},
        })
    })

    it('shows the URL that will be opened for the OAuth flow', async function () {
      await runCommand(Cmd, [
        'fake-sfdc-org',
        '--app',
        'my-app',
      ])

      expect(stderr.output).to.contain(`Opening browser to ${authorization.extra.redirect_uri}`)
    })

    it('attempts to open the browser to the redirect URI', async function () {
      await runCommand(Cmd, [
        'fake-sfdc-org',
        '--app',
        'my-app',
      ])

      expect(urlOpener.calledWith(authorization.extra.redirect_uri, {wait: false})).to.equal(true)
    })

    it('shows the expected output when the authentication is successful', async function () {
      await runCommand(Cmd, [
        'fake-sfdc-org',
        '--app',
        'my-app',
      ])

      expect(stderr.output).to.eq(heredoc`
        Opening browser to https://fake-sfdc-org.my.salesforce.com/services/oauth2
        Heroku Events: Waiting for authentication...
        Heroku Events: Waiting for authentication... done
        `)
      expect(stdout.output).to.eq('')
    })
  })

  context('when the users rejects the prompt to open the browser', function () {
    beforeEach(function () {
      urlOpener = sandbox.stub(Cmd, 'urlOpener')
      sandbox.stub(ux, 'anykey').onFirstCall().rejects(new Error('quit'))
      eventsApi
        .post('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/platforms/salesforce/authorizations')
        .reply(200, authorization)
        .delete('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/authorizations/456789ab-cdef-0123-4567-89abcdef0123')
        .reply(200, authorization)
    })

    it('destroys the authorization', async function () {
      try {
        await runCommand(Cmd, [
          'fake-sfdc-org',
          '--app',
          'my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal('quit')
        expect(oclif.exit).to.equal(1)
      }

      expect(stderr.output).to.eq(heredoc`
        Opening browser to https://fake-sfdc-org.my.salesforce.com/services/oauth2
      `)
    })
  })
})
