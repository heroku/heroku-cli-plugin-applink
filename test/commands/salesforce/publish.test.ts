import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/salesforce/publish'
import {
  addon,
  legacyAddon,
  sso_response,
} from '../../helpers/fixtures'
import stripAnsi from '../../helpers/strip-ansi'
import {CLIError} from '@oclif/core/lib/errors'
import fs from 'fs'

describe('salesforce:publish', function () {
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

      expect(stripAnsi(stderr.output)).to.contain('Publishing my-app to myorg as AccountAPI')
      expect(stdout.output).to.equal('')
    })
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
          HEROKU_INTEGRATION_TOKEN: 'token',
        })
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response)
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

      expect(stripAnsi(stderr.output)).to.contain('Publishing my-app to myorg as AccountAPI')
      expect(stdout.output).to.equal('')
    })
  })

  it('throws an error when API spec file is not found', async function () {
    const nonExistentPath = `${__dirname}/non-existent-file.json`

    try {
      await runCommand(Cmd, [
        nonExistentPath,
        '--app=my-app',
        '--addon=my-addon',
        '--client-name=AccountAPI',
        '--connection-name=myorg',
      ])
    } catch (error: unknown) {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.contain(`API spec file not found: ${nonExistentPath}`)
      expect(oclif.exit).to.equal(1)
    }
  })

  it('throws an error when API spec file has invalid format', async function () {
    const invalidFormatPath = `${__dirname}/../../helpers/invalid.txt`

    fs.writeFileSync(invalidFormatPath, 'test content')

    try {
      await runCommand(Cmd, [
        invalidFormatPath,
        '--app=my-app',
        '--addon=my-addon',
        '--client-name=AccountAPI',
        '--connection-name=myorg',
      ])
    } catch (error: unknown) {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.contain('API spec file must be either YAML (.yaml/.yml) or JSON (.json) format')
      expect(oclif.exit).to.equal(1)
    } finally {
      fs.unlinkSync(invalidFormatPath)
    }
  })

  it('throws an error when both connectedapp-meta.xml exists and authorization-connected-app-name is provided', async function () {
    const metadataDir = `${__dirname}/../../helpers/metadata`
    const apiSpecPath = `${__dirname}/../../helpers/openapi.json`

    fs.mkdirSync(metadataDir, {recursive: true})
    fs.writeFileSync(`${metadataDir}/connectedapp-meta.xml`, '<xml>test</xml>')

    try {
      await runCommand(Cmd, [
        apiSpecPath,
        '--app=my-app',
        '--addon=my-addon',
        '--client-name=AccountAPI',
        '--connection-name=myorg',
        '--metadata-dir',
        metadataDir,
        '--authorization-connected-app-name=TestApp',
      ])
    } catch (error: unknown) {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.contain('Cannot specify both connectedapp-meta.xml in metadata directory and --authorization-connected-app-name flag')
      expect(oclif.exit).to.equal(1)
    } finally {
      fs.unlinkSync(`${metadataDir}/connectedapp-meta.xml`)
      fs.rmdirSync(metadataDir)
    }
  })

  it('throws an error when both permissionset-meta.xml exists and authorization-permission-set-name is provided', async function () {
    const metadataDir = `${__dirname}/../../helpers/metadata`
    const apiSpecPath = `${__dirname}/../../helpers/openapi.json`

    fs.mkdirSync(metadataDir, {recursive: true})
    fs.writeFileSync(`${metadataDir}/permissionset-meta.xml`, '<xml>test</xml>')

    try {
      await runCommand(Cmd, [
        apiSpecPath,
        '--app=my-app',
        '--addon=my-addon',
        '--client-name=AccountAPI',
        '--connection-name=myorg',
        '--metadata-dir',
        metadataDir,
        '--authorization-permission-set-name=TestPermSet',
      ])
    } catch (error: unknown) {
      const {message, oclif} = error as CLIError
      expect(stripAnsi(message)).to.contain('Cannot specify both permissionset-meta.xml in metadata directory and --authorization-permission-set-name flag')
      expect(oclif.exit).to.equal(1)
    } finally {
      fs.unlinkSync(`${metadataDir}/permissionset-meta.xml`)
      fs.rmdirSync(metadataDir)
    }
  })
})
