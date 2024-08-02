import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'
import heredoc from 'tsheredoc'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/events/unlink'
import {addon, publication1, subscription} from '../../helpers/fixtures'

describe('events:unlink', function () {
  let api: nock.Scope
  let eventsApi: nock.Scope
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
  })

  afterEach(function () {
    process.env = env
    api.done()
    eventsApi.done()
    nock.cleanAll()
  })

  it('it shows the expected output when the unlink command is successful', async function () {
    eventsApi
      .delete(`/v1/tenants/01234567-89ab-cdef-0123-456789abcdef/subscriptions/${subscription.id}/publications/${publication1.id}`)
      .reply(200, [subscription])

    await runCommand(Cmd, [
      subscription.id,
      publication1.id,
      '--app',
      'my-app',
    ])

    expect(stderr.output).to.equal(heredoc`
      Unlinking ${publication1.id} from ${subscription.id}...
      Unlinking ${publication1.id} from ${subscription.id}... done
    `)
    expect(stdout.output).to.eq('')
  })
})
