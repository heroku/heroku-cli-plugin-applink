import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';

import Cmd from '../../../src/commands/salesforce/publications.js';
import {
  addon,
  addonAttachment,
  app,
  connection1,
  connection2_connected,
  connection2_connecting,
  connection2_failed,
  publication1,
  publication2,
  sso_response,
} from '../../helpers/fixtures.js';
import stripAnsi from '../../helpers/strip-ansi.js';
import removeAllWhitespace from '../../helpers/utils/remove-whitespaces.js';

describe('salesforce:publications', function () {
  let api: nock.Scope;
  let applinkApi: nock.Scope;
  const {env} = process;

  beforeEach(function () {
    process.env = {};
    api = nock('https://api.heroku.com');
    applinkApi = nock('https://applink-api.heroku.com');

    api
      .get('/apps/my-app')
      .reply(200, app)
      .get('/apps/my-app/addons')
      .reply(200, [addon])
      .get('/apps/my-app/addon-attachments')
      .reply(200, [addonAttachment])
      .get('/apps/my-app/config-vars')
      .reply(200, {
        HEROKU_APPLINK_API_URL:
          'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
        HEROKU_APPLINK_TOKEN: 'token',
      })
      .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
      .reply(200, sso_response);
  });

  afterEach(function () {
    process.env = env;
    api.done();
    applinkApi.done();
    nock.cleanAll();
  });

  it('when there are no Heroku AppLink connections on the app it displays an error', async function () {
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
      .reply(200, []);

    const {error} = await runCommand(Cmd, ['--app=my-app']);

    expect(error).to.exist;
    expect(stripAnsi(error!.message)).to.contain('There are no Heroku AppLink connections for my-app.');
  });

  it('when there are no active Heroku AppLink connections on the app it displays an error', async function () {
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
      .reply(200, [connection2_connecting, connection2_failed]);

    const {error} = await runCommand(Cmd, ['--app=my-app']);

    expect(error).to.exist;
    expect(stripAnsi(error!.message)).to.contain('There are no active Heroku AppLink connections for my-app.');
  });

  it('when the app has not been published to a Salesforce org it shows a message', async function () {
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
      .reply(200, [connection1, connection2_connected])
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-1/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, [])
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-2/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, []);

    const {stdout} = await runCommand(Cmd, ['--app=my-app']);

    expect(stripAnsi(stdout)).to.contain("You haven't published my-app to a Salesforce org yet.");
  });

  it('when the app has been published to active Salesforce connections it prints a table with publication details', async function () {
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
      .reply(200, [connection1, connection2_connected])
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-1/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, [publication1])
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-2/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, [publication2]);

    const {stdout} = await runCommand(Cmd, ['--app=my-app']);

    const actual = removeAllWhitespace(stdout);
    expect(actual).to.include(removeAllWhitespace('Salesforce publications for app'));
    expect(actual).to.include(removeAllWhitespace('connection1'));
    expect(actual).to.include(removeAllWhitespace('connection2'));
    expect(actual).to.include(removeAllWhitespace('00DSG000007a3BcA84'));
    expect(actual).to.include(removeAllWhitespace('user@example.com'));
  });

  it('when the connection_name flag is specified and app has been published to the specified Salesforce connection it prints a table', async function () {
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/connection1')
      .reply(200, connection1)
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/salesforce/my-org-1/apps/89abcdef-0123-4567-89ab-cdef01234567')
      .reply(200, [publication1]);

    const {stdout} = await runCommand(Cmd, [
      '--app=my-app',
      '--connection_name=connection1',
    ]);

    const actual = removeAllWhitespace(stdout);
    expect(actual).to.include(removeAllWhitespace('connection1'));
    expect(actual).to.include(removeAllWhitespace('00DSG000007a3BcA84'));
  });
});
