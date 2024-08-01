import {ux} from '@oclif/core'
import {expect} from 'chai'
import nock from 'nock'
import * as sinon from 'sinon'
import {stderr} from 'stdout-stderr'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/events/publications/destroy'
import stripAnsi from '../../../helpers/strip-ansi'
import {CLIError} from '@oclif/core/lib/errors'
import {addon, publication2} from '../../../helpers/fixtures'
import heredoc from 'tsheredoc'

describe('events:publications:destroy', function () {
  let api: nock.Scope
  let eventsApi: nock.Scope
  let promptStub: sinon.SinonStub
  const {env} = process

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
    promptStub = sinon.stub(ux, 'prompt')
  })

  afterEach(function () {
    process.env = env
    api.done()
    eventsApi.done()
    nock.cleanAll()
    sinon.restore()
  })

  context('when the user uses the --confirm flag', function () {
    it('returns an error message if the app name with the --confirm flag does not match', async function () {
      try {
        await runCommand(Cmd, [
          'fakeOrgAccountCreated',
          '--app=my-app',
          '--confirm=my-other-app',
        ])
      } catch (error) {
        const {message} = error as CLIError
        expect(stripAnsi(message)).to.equal('Confirmation my-other-app did not match my-app. Aborted.')
      }
    })

    it('shows the expected output when the app name with the --confirm flag does match and the command is successful', async function () {
      eventsApi
        .delete('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/publications/fakeOrgAccountCreated')
        .reply(200, publication2)

      await runCommand(Cmd, [
        'fakeOrgAccountCreated',
        '--app=my-app',
        '--confirm=my-app',
      ])

      expect(stripAnsi(stderr.output)).to.eq(heredoc`
        Destroying publication fakeOrgAccountCreated on my-app...
        Destroying publication fakeOrgAccountCreated on my-app... done
      `)
    })
  })

  context('when the user does not use the --confirm flag', function () {
    it('returns an error message if the app name entered does not match', async function () {
      promptStub.onFirstCall().resolves('my-other-app')
      try {
        await runCommand(Cmd, [
          'fakeOrgAccountCreated',
          '--app=my-app',
          '--confirm=my-other-app',
        ])
      } catch (error) {
        const {message} = error as CLIError
        expect(stripAnsi(message)).to.equal('Confirmation my-other-app did not match my-app. Aborted.')
      }
    })

    it('shows the expected output when the app name matches and the command is successful', async function () {
      promptStub.onFirstCall().resolves('my-app')

      eventsApi
        .delete('/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/publications/fakeOrgAccountCreated')
        .reply(200, publication2)

      await runCommand(Cmd, [
        'fakeOrgAccountCreated',
        '--app=my-app',
        '--confirm=my-app',
      ])

      expect(stripAnsi(stderr.output)).to.eq(heredoc`
        Destroying publication fakeOrgAccountCreated on my-app...
        Destroying publication fakeOrgAccountCreated on my-app... done
      `)
    })
  })
})
