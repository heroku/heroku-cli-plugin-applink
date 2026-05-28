import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';

import Cmd from '../../../../src/commands/datacloud/data-action-target/create.js';
import {
  addon,
  addonAttachment,
  app,
  datCreateFailed,
  datCreatePending,
  datCreateSuccess,
  sso_response,
} from '../../../helpers/fixtures.js';
import stripAnsi from '../../../helpers/strip-ansi.js';

describe('datacloud:data-action-target:create', function () {
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

  it('creates a data action target successfully when status is immediately created', async function () {
    applinkApi
      .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/productionOrg/data_action_targets')
      .reply(202, datCreateSuccess);

    const {error, stderr} = await runCommand(Cmd, [
      'My Data Action Target',
      '--app=my-app',
      '--connection-name=productionOrg',
      '--target-api-path=/handleDataCloudDataChangeEvent',
    ]);

    expect(error).to.not.exist;
    expect(stripAnsi(stderr)).to.contain('Created');
  });

  it('polls until status is created', async function () {
    applinkApi
      .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/productionOrg/data_action_targets')
      .reply(202, datCreatePending);
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/productionOrg/data_action_targets/MyDataActionTarget')
      .reply(200, datCreateSuccess);

    const {error} = await runCommand(Cmd, [
      'My Data Action Target',
      '--app=my-app',
      '--connection-name=productionOrg',
      '--target-api-path=/handleDataCloudDataChangeEvent',
      '--api-name=MyDataActionTarget',
    ]);

    expect(error).to.not.exist;
  });

  it('stops polling when creation fails', async function () {
    applinkApi
      .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/productionOrg/data_action_targets')
      .reply(202, datCreatePending);
    applinkApi
      .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/productionOrg/data_action_targets/MyDataActionTarget')
      .reply(200, datCreateFailed);

    const {error, stderr} = await runCommand(Cmd, [
      'My Data Action Target',
      '--app=my-app',
      '--connection-name=productionOrg',
      '--target-api-path=/handleDataCloudDataChangeEvent',
      '--api-name=MyDataActionTarget',
    ]);

    expect(error).to.not.exist;
    expect(stripAnsi(stderr)).to.contain('Creation Failed');
  });

  it('uses label as api-name when --api-name is not provided', async function () {
    let requestBody: unknown;
    applinkApi
      .post(
        '/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/productionOrg/data_action_targets',
        (body: unknown) => {
          requestBody = body;
          return true;
        },
      )
      .reply(202, datCreateSuccess);

    await runCommand(Cmd, [
      'My Data Action Target',
      '--app=my-app',
      '--connection-name=productionOrg',
      '--target-api-path=/handleDataCloudDataChangeEvent',
    ]);

    const body = requestBody as {api_name: string};
    expect(body.api_name).to.eq('My_Data_Action_Target');
  });

  it('uses the provided --api-name flag', async function () {
    let requestBody: unknown;
    applinkApi
      .post(
        '/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/productionOrg/data_action_targets',
        (body: unknown) => {
          requestBody = body;
          return true;
        },
      )
      .reply(202, datCreateSuccess);

    await runCommand(Cmd, [
      'My Data Action Target',
      '--app=my-app',
      '--connection-name=productionOrg',
      '--target-api-path=/handleDataCloudDataChangeEvent',
      '--api-name=CustomApiName',
    ]);

    const body = requestBody as {api_name: string};
    expect(body.api_name).to.eq('CustomApiName');
  });

  it('sends correct request body fields', async function () {
    let requestBody: unknown;
    applinkApi
      .post(
        '/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/productionOrg/data_action_targets',
        (body: unknown) => {
          requestBody = body;
          return true;
        },
      )
      .reply(202, datCreateSuccess);

    await runCommand(Cmd, [
      'My Data Action Target',
      '--app=my-app',
      '--connection-name=productionOrg',
      '--target-api-path=/handleDataCloudDataChangeEvent',
      '--type=webhook',
      '--api-name=MyDAT',
    ]);

    const body = requestBody as {
      api_name: string;
      label: string;
      target_endpoint: string;
      type: string;
    };
    expect(body.label).to.eq('My Data Action Target');
    expect(body.api_name).to.eq('MyDAT');
    expect(body.target_endpoint).to.eq('/handleDataCloudDataChangeEvent');
    expect(body.type).to.eq('webhook');
  });
});
