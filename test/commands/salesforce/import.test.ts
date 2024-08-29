import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/salesforce/import'
import {
  addon,
  appImportPending,
  appImportSuccess,
  appImportFailed,
} from '../../helpers/fixtures'
import stripAnsi from '../../helpers/strip-ansi'
import {CLIError} from '@oclif/core/lib/errors'
import {encoded} from '../../helpers/encodedSpecs'
import {AppImportRequestBody} from '../../../src/lib/integration/types'

describe('salesforce:import', function () {
  let api: nock.Scope
  let integrationApi: nock.Scope
  const {env} = process

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
  })

  afterEach(function () {
    process.env = env
    api.done()
    integrationApi.done()
    nock.cleanAll()
  })

  it('waits for the apps info endpoint status to return "imported" before ending the action successfully', async function () {
    integrationApi
      .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/myorg/app_imports')
      .reply(202, appImportPending)
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg/app_imports/AccountAPI')
      .reply(200, appImportPending)
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg/app_imports/AccountAPI')
      .reply(200, appImportPending)
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg/app_imports/AccountAPI')
      .reply(200, appImportSuccess)

    const filePath = `${__dirname}/../../helpers/openapi.json`

    await runCommand(Cmd, [
      filePath,
      '--app=my-app',
      '--client-name=AccountAPI',
      '--generate-auth-permission-set',
      '--org-name=myorg',
    ])

    expect(stderr.output).to.contain('Importing App... Imported')
    expect(stdout.output).to.equal('')
  })

  it('throws an error when the apps info endpoint status returns "import failed"', async function () {
    integrationApi
      .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/myorg/app_imports')
      .reply(202, appImportPending)
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg/app_imports/AccountAPI')
      .reply(200, appImportFailed)

    const filePath = `${__dirname}/../../helpers/openapi.json`

    try {
      await runCommand(Cmd, [
        filePath,
        '--app=my-app',
        '--client-name=AccountAPI',
        '--generate-auth-permission-set',
        '--org-name=myorg',
      ])
    } catch (error: unknown) {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.equal('Import Failed')
      expect(oclif.exit).to.equal(1)
    }

    expect(stdout.output).to.equal('')
  })
})
