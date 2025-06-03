import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../../../run-command'
import Cmd from '../../../../src/commands/datacloud/data-action-target/create'
import {
  addon,
  datCreatePending,
  datCreateSuccess,
  datCreateFailed,
  sso_response,
} from '../../../helpers/fixtures'
import stripAnsi from '../../../helpers/strip-ansi'
import {CLIError} from '@oclif/core/lib/errors'

describe('datacloud:data-action-target:create', function () {
  let api: nock.Scope
  let applinkApi: nock.Scope
  const {env} = process

  context('when config var is set to HEROKU_APPLINK_API_URL', function () {
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
    })

    afterEach(function () {
      process.env = env
      api.done()
      applinkApi.done()
      nock.cleanAll()
    })

    it('waits for /data_action_targets status to return "created" before ending the action successfully', async function () {
      applinkApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(202, datCreatePending)
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets/MyDataActionTarget')
        .reply(200, datCreatePending)
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets/MyDataActionTarget')
        .reply(200, datCreatePending)
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets/MyDataActionTarget')
        .reply(200, datCreateSuccess)

      await runCommand(Cmd, [
        'My Data Action Target',
        '--app=my-app',
        '--api-name=MyDataActionTarget',
        '--connection-name=myorg',
        '--target-api-path=/handleDataCloudDataChangeEvent',
        '--type=WebHook',
      ])

      expect(stderr.output).to.contain('Created')
      expect(stdout.output).to.equal('')
    })

    it('throws an error when /data_action_targets status returns "creation failed"', async function () {
      applinkApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(202, datCreatePending)
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets/My_Data_Action_Target')
        .reply(200, datCreateFailed)

      try {
        await runCommand(Cmd, [
          'My Data Action Target',
          '--app=my-app',
          '--connection-name=myorg',
          '--target-api-path=/handleDataCloudDataChangeEvent',
        ])
      } catch (error: unknown) {
        const {message, oclif} = error as CLIError
        expect(stripAnsi(message)).to.equal('Creation Failed')
        expect(oclif.exit).to.equal(1)
      }

      expect(stdout.output).to.equal('')
    })
  })
})
