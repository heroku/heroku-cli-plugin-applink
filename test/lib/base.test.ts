import {flags} from '@heroku-cli/command'
import {CLIError} from '@oclif/core/lib/errors'
import {expect} from 'chai'
import netrc from 'netrc-parser'
import nock from 'nock'
import heredoc from 'tsheredoc'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../run-command'
import BaseCommand from '../../src/lib/base'
import * as Events from '../../src/lib/events/types'
import stripAnsi from '../helpers/strip-ansi'

class CommandWithoutConfiguration extends BaseCommand {
  async run() {
    this.events.get<Array<Events.Authorization>>(`/v1/tenants/${this.tenant_id}/authorizations`)
  }
}

class CommandWithConfiguration extends BaseCommand {
  static flags = {
    app: flags.app({required: true}),
  }

  async run() {
    const {flags} = await this.parse(CommandWithConfiguration)
    const {app} = flags
    await this.configureEventsClient(app)
    this.events.get<Array<Events.Authorization>>(`/v1/tenants/${this.tenant_id}/authorizations`)
  }
}

netrc.loadSync = function (this: typeof netrc) {
  netrc.machines = {
    'api.heroku.com': {password: 'mypass'},
  }
}

describe('Heroku Events API client', function () {
  const {env} = process
  let api: nock.Scope
  let eventsApi: nock.Scope
  const addon = {
    name: 'herokuevents-horizontal-01234',
    addon_service: {
      id: '01234567-89ab-cdef-0123-456789abcdef',
      name: 'herokuevents',
    },
  }

  beforeEach(function () {
    process.env = {}
    api = nock('https://api.heroku.com')
    eventsApi = nock('https://events-api.heroku.com')
  })

  afterEach(function () {
    process.env = env
    api.done()
    eventsApi.done()
    nock.cleanAll()
  })

  context('when the client wasn’t configured', function () {
    it('returns an error message and exits with a status of 1', async function () {
      try {
        await runCommand(CommandWithoutConfiguration, [
          '--app',
          'my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
          Heroku Events API Client not configured.
          Did you call await this.configureEventsClient(app, this.config) before accessing this.events?
        `)
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })

  context('when the app doesn’t have the Heroku Events add-on installed', function () {
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
          '--app',
          'my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
          Heroku Events add-on isn’t present on my-app.
          Install the add-on using heroku addons:create herokuevents -a my-app.
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
          '--app',
          'my-app',
        ])
      } catch (error) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal(heredoc`
          Heroku Events add-on isn’t fully provisioned on my-app.
          Wait for the add-on to finish provisioning with heroku addons:wait herokuevents -a my-app.
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
          HEROKUEVENTS_API_URL: 'https://events-api.heroku.com/v1/tenants/01234567-89ab-cdef-0123-456789abcdef',
        })
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/authorizations')
        .reply(200, [])
    })

    it('makes the request', async function () {
      await runCommand(CommandWithConfiguration, [
        '--app',
        'my-app',
      ])

      expect(stderr.output).to.equal('')
      expect(stdout.output).to.equal('')
    })
  })

  context('when HEROKU_EVENTS_ADDON is set', function () {
    beforeEach(async function () {
      process.env = {
        HEROKU_EVENTS_ADDON: 'herokuevents-qa',
      }
      addon.addon_service.name = 'herokuevents-qa'

      api
        .get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKUEVENTS_QA_API_URL: 'https://events-api.heroku.com/v1/tenants/01234567-89ab-cdef-0123-456789abcdef',
        })
      eventsApi
        .get('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/authorizations')
        .reply(200, [])
    })

    it('respects the value of HEROKU_EVENTS_ADDON', async function () {
      await runCommand(CommandWithConfiguration, [
        '--app',
        'my-app',
      ])

      expect(stderr.output).to.equal('')
      expect(stdout.output).to.equal('')
    })
  })
})
