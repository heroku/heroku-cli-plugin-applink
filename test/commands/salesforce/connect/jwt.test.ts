import nock from 'nock'
import Cmd from '../../../../src/commands/salesforce/connect/jwt'
import {runCommand} from '../../../run-command'
import {credential_id} from '../../../helpers/fixtures'

describe ('salesforce:connect:jwt', function () {
  let integrationApi: nock.Scope
  const {env} = process

  beforeEach(function () {
    process.env = {}
    integrationApi = nock('https://heroku-integration.heroku.com').post('/salesforce/oauth/jwt').reply(200, credential_id)
  })

  afterEach(function () {
    process.env = env
    integrationApi.done()
    nock.cleanAll()
  })

  it('valid requests returns 200', async function () {
    await runCommand(Cmd, [
      '--client-id=3MVG9Ivbdt5rNyimEEg1aKfXcxuHFZblrzaFP6Fbm23yJAr3jcyCAl2GYr2T0u_IApkXd.FkMBYNM0ZqZc9aT',
      '--jwt-key-file=rsa.key',
      '--username=test-2mhpnyuxne8k@example.com',
      '-l https://test.salesforce.com',
    ])
  })
})
