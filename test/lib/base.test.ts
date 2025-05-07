import {flags} from '@heroku-cli/command'
import {CLIError} from '@oclif/core/lib/errors'
import {expect} from '@oclif/test'
import netrc from 'netrc-parser'
import nock from 'nock'
import heredoc from 'tsheredoc'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../run-command'
import BaseCommand from '../../src/lib/base'
import * as AppLink from '../../src/lib/applink/types'
import stripAnsi from '../helpers/strip-ansi'
import {
  addon,
  addon2,
  addonStaging,
  sso_response,
} from '../helpers/fixtures'

class CommandWithoutConfiguration extends BaseCommand {
  async run() {
    this.applinkClient.get<Array<AppLink.SalesforceConnection>>(`/addons/${this.addonId}/connections`)
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
    await this.configureAppLinkClient(app, addon)
    this.applinkClient.get<Array<AppLink.SalesforceConnection>>(`/addons/${this.addonId}/connections`)
  }
}

// eslint-disable-next-line no-unused-vars
netrc.loadSync = function (this: typeof netrc) {
  netrc.machines = {
    'api.heroku.com': {password: 'mypass'},
  }
}

describe('attempt a request using the applink API client', function () {
  const {env} = process
  let api: nock.Scope
  let applinkApi: nock.Scope

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
          Did you call await this.configureAppLinkClient(app, this.config) before accessing this.applinkClient?
        `)
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })

  context('when the app doesn’t have the Heroku AppLink add-on installed', function () {
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
          Install the add-on using heroku addons:create heroku-applink -a my-app.
        `)
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })

  context('when the add-on is not fully provisioned', function () {
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
          Wait for the add-on to finish provisioning with heroku addons:wait heroku-applink -a my-app.
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
          HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: 'token',
        })
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response)
      applinkApi
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

  context('when HEROKU_APPLINK_ADDON is set', function () {
    beforeEach(async function () {
      process.env = {
        HEROKU_APPLINK_ADDON: 'heroku-applink-staging',
      }

      api
        .get('/apps/my-app/addons')
        .reply(200, [addonStaging])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: 'token',
        })
        .get('/apps/my-app/addons/6789abcd-ef01-2345-6789-abcdef012345/sso')
        .reply(200, sso_response)
      applinkApi
        .get('/addons/6789abcd-ef01-2345-6789-abcdef012345/connections')
        .reply(200, [])
    })

    it('respects the value of HEROKU_APPLINK_ADDON', async function () {
      await runCommand(CommandWithConfiguration, [
        '--app=my-app',
      ])

      expect(stderr.output).to.equal('')
      expect(stdout.output).to.equal('')
    })
  })

  context('when the --addon flag is specified', function () {
    beforeEach(async function () {
      api
        .get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: 'token',
        })
    })

    it('uses the specified add-on name', async function () {
      api
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response)
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, [])

      await runCommand(CommandWithConfiguration, [
        '--app=my-app',
        '--addon=heroku-applink-vertical-01234',
      ])

      expect(stderr.output).to.equal('')
      expect(stdout.output).to.equal('')
    })

    it('uses the specified add-on ID', async function () {
      api
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response)
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, [])

      await runCommand(CommandWithConfiguration, [
        '--app=my-app',
        '--addon=01234567-89ab-cdef-0123-456789abcdef',
      ])

      expect(stderr.output).to.equal('')
      expect(stdout.output).to.equal('')
    })

    it('returns an error message and exits with a status of 1 if the add-on doesn’t exist', async function () {
      try {
        await runCommand(CommandWithConfiguration, [
          '--app=my-app',
          '--addon=my-addon-2',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
          AppLink add-on my-addon-2 doesn't exist on my-app.
          Use heroku addons:list --app my-app to list the add-ons on the app.
        `)
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })
  context('when there are multiple AppLink addons', function () {
    beforeEach(async function () {
      api
        .get('/apps/my-app/addons')
        .reply(200, [addon, addon2])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL: 'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_TOKEN: 'token',
        })
    })

    it('uses the specified add-on', async function () {
      api
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response)
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, [])

      await runCommand(CommandWithConfiguration, [
        '--app=my-app',
        '--addon=heroku-applink-vertical-01234',
      ])

      expect(stderr.output).to.equal('')
      expect(stdout.output).to.equal('')
    })

    it('returns an error message and exits with a status of 1 if no addon is specified', async function () {
      try {
        await runCommand(CommandWithConfiguration, [
          '--app=my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
          Your app my-app has multiple AppLink add-ons.
          Rerun the command with the --addon flag to specify which one to use.
        `)
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })
})
