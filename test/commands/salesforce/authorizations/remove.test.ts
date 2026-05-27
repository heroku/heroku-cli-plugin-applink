import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';

import Cmd from '../../../../src/commands/salesforce/authorizations/remove.js';
import {
  addon,
  addonAttachment,
  app,
  sso_response,
} from '../../../helpers/fixtures.js';
describe('salesforce:authorizations:remove', function () {
  let api: nock.Scope;
  let applinkApi: nock.Scope;
  const {env} = process;

  beforeEach(function () {
    process.env = {};
    api = nock('https://api.heroku.com')
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
    applinkApi = nock('https://applink-api.heroku.com');
  });

  afterEach(function () {
    process.env = env;
    api.done();
    applinkApi.done();
    nock.cleanAll();
  });

  it('successfully removes a Salesforce authorization from a Heroku app', async function () {
    applinkApi
      .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/my-auth-1')
      .reply(200, {});

    const {error} = await runCommand(Cmd, [
      'my-auth-1',
      '--app=my-app',
      '--addon=heroku-applink-vertical-01234',
      '--confirm=my-auth-1',
    ]);

    expect(error).to.not.exist;
  });
});
