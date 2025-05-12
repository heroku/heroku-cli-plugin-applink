import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/salesforce/publish'
import {
  addon,
  legacyAddon,
} from '../../helpers/fixtures'
// import stripAnsi from '../../helpers/strip-ansi'
// import {CLIError} from '@oclif/core/lib/errors'

describe.only('salesforce:publish', function () {
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
          HEROKU_APPLINK_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
      applinkApi = nock('https://applink-api.heroku.com')
    })

    afterEach(function () {
      process.env = env
      api.done()
      applinkApi.done()
      nock.cleanAll()
    })

    it('successfully publishes an API spec file', async function () {
      applinkApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/myorg/apps')
        .reply(201, [])

      const filePath = `${__dirname}/../../helpers/openapi.json`

      await runCommand(Cmd, [
        filePath,
        '--app=my-app',
        '--addon=heroku-applink-vertical-01234',
        '--client-name=AccountAPI',
        '--connection-name=myorg',
      ])
      expect(stdout.output).to.equal('')
    })

    // it('waits for the apps info endpoint status to return "imported" before ending the action successfully', async function () {
    //   // applinkApi
    //   //   .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/myorg/app_imports')
    //   //   .reply(202, appImportPending)

    //   const filePath = `${__dirname}/../../helpers/openapi.json`

    //   await runCommand(Cmd, [
    //     filePath,
    //     '--app=my-app',
    //     '--client-name=AccountAPI',
    //     '--generate-auth-permission-set',
    //     '--org-name=myorg',
    //   ])

    //   expect(stderr.output).to.contain('Publishing my-app to myconnection as myclient')
    //   expect(stdout.output).to.equal('')
    // })

    // it('throws an error when the apps info endpoint status returns "import failed"', async function () {
    // applinkApi
    //   .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/myorg/app_imports')
    //   .reply(202, appImportPending)

    // const filePath = `${__dirname}/../../helpers/openapi.json`

    // try {
    //   await runCommand(Cmd, [
    //     filePath,
    //     '--app=my-app',
    //     '--client-name=AccountAPI',
    //     '--generate-auth-permission-set',
    //     '--org-name=myorg',
    //   ])
    // } catch (error: unknown) {
    //   const {message, oclif} = error as CLIError
    //   expect(stripAnsi(message)).to.equal('Import Failed')
    //   expect(oclif.exit).to.equal(1)
    // }

    // expect(stdout.output).to.equal('')
    // })
  })

  context('when config var is set to the legacy HEROKU_INTEGRATION_API_URL', function () {
    let integrationApi: nock.Scope

    beforeEach(function () {
      process.env = {}
      api = nock('https://api.heroku.com')
        .get('/apps/my-app/addons')
        .reply(200, [legacyAddon])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_INTEGRATION_API_URL: 'https://integration-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_INTEGRATION_TOKEN: '01234567-89ab-cdef-0123-456789abcdef',
        })
      integrationApi = nock('https://integration-api.heroku.com')
    })

    afterEach(function () {
      process.env = env
      api.done()
      integrationApi.done()
      nock.cleanAll()
    })

    it('successfully publishes an API spec file', async function () {
      integrationApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/myorg/apps')
        .reply(201, [])

      const filePath = `${__dirname}/../../helpers/openapi.json`

      await runCommand(Cmd, [
        filePath,
        '--app=my-app',
        '--addon=heroku-integration-vertical-01234',
        '--client-name=AccountAPI',
        '--connection-name=myorg',
      ])
      expect(stdout.output).to.equal('')
    })

  // it('waits for the apps info endpoint status to return "imported" before ending the action successfully', async function () {
  //   integrationApi
  //     .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/myorg/app_imports')
  //     .reply(202, appImportPending)

  //   const filePath = `${__dirname}/../../helpers/openapi.json`

  //   await runCommand(Cmd, [
  //     filePath,
  //     '--app=my-app',
  //     '--client-name=AccountAPI',
  //     '--generate-auth-permission-set',
  //     '--org-name=myorg',
  //   ])

  //   expect(stderr.output).to.contain('Imported')
  //   expect(stdout.output).to.equal('')
  })
  // })
})
