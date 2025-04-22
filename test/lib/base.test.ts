import {flags} from '@heroku-cli/command'
import {CLIError} from '@oclif/core/lib/errors'
import {expect} from '@oclif/test'
import netrc from 'netrc-parser'
import nock from 'nock'
import heredoc from 'tsheredoc'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../run-command'
import BaseCommand from '../../src/lib/base'
import * as Integration from '../../src/lib/integration/types'
import stripAnsi from '../helpers/strip-ansi'
import {addon} from '../helpers/fixtures'

class CommandWithoutConfiguration extends BaseCommand {
  async run() {
    this.integration.get<Array<Integration.SalesforceConnection>>(`/addons/${this.addonId}/connections`)
  }
}

class CommandWithConfiguration extends BaseCommand {
  static flags = {
    app: flags.app({required: true}),
    addon: flags.string(),
  }

  async run() {
    const {flags} = await this.parse(CommandWithConfiguration)
    const {app, addon} = flags
    await this.configureIntegrationClient(app, addon)
    this.integration.get<Array<Integration.SalesforceConnection>>(`/addons/${this.addonId}/connections`)
  }
}

// eslint-disable-next-line no-unused-vars
netrc.loadSync = function (this: typeof netrc) {
  netrc.machines = {
    'api.heroku.com': {password: 'mypass'},
  }
}

describe('attempt a request using the Integration API client', function () {
  const {env} = process
  let api: nock.Scope
  let integrationApi: nock.Scope

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

  context('when the client wasn’t configured', function () {
    it('returns an error message and exits with a status of 1', async function () {
      try {
        await runCommand(CommandWithoutConfiguration, [
          '--app=my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
          AppLink API Client not configured.
          Did you call await this.configureIntegrationClient(app, this.config) before accessing this.integration?
        `)
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })

  context('when the app doesn’t have the Heroku Integration add-on installed', function () {
    beforeEach(async function () {
      api
        .get('/apps/my-app/addons')
        .reply(200, [])
        .get('/apps/my-app/config-vars')
        .reply(200, {})
    })

    it('returns an error message and exits with a status of 1', async function () {
      try {
        await runCommand(CommandWithConfiguration, [
          '--app=my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
          AppLink add-on isn’t present on my-app.
          Install the add-on using heroku addons:create heroku-integration -a my-app.
        `)
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })

  context('when the add-on isn’t fully provisioned', function () {
    beforeEach(async function () {
      api
        .get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {})
    })

    it('returns an error message and exits with a status of 1', async function () {
      try {
        await runCommand(CommandWithConfiguration, [
          '--app=my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
          AppLink add-on isn’t fully provisioned on my-app.
          Wait for the add-on to finish provisioning with heroku addons:wait heroku-integration -a my-app.
        `)
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })

  context('when the add-on is correctly provisioned', function () {
    beforeEach(async function () {
      api
        .get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
      integrationApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, [])
    })

    it('makes the request', async function () {
      await runCommand(CommandWithConfiguration, [
        '--app=my-app',
      ])

      expect(stderr.output).to.equal('')
      expect(stdout.output).to.equal('')
    })
  })

  context('when HEROKU_INTEGRATION_ADDON is set', function () {
    beforeEach(async function () {
      process.env = {
        HEROKU_INTEGRATION_ADDON: 'heroku-integration-staging',
      }
      addon.addon_service = {...addon.addon_service, name: 'heroku-integration-staging'}

      api
        .get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
      integrationApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, [])
    })

    it('respects the value of HEROKU_INTEGRATION_ADDON', async function () {
      await runCommand(CommandWithConfiguration, [
        '--app=my-app',
      ])

      expect(stderr.output).to.equal('')
      expect(stdout.output).to.equal('')
    })
  })
})
