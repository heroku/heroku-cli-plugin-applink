import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';

import Cmd from '../../../../src/commands/applink/connections/info.js';
import {
  addon,
  addonAttachment,
  app,
  connection2_connected,
  sso_response,
} from '../../../helpers/fixtures.js';
import stripAnsi from '../../../helpers/strip-ansi.js';

describe('applink:connections:info', function () {
  let api: nock.Scope;
  let applinkApi: nock.Scope;
  const {env} = process;

  context('when config var is set to the HEROKU_APPLINK_API_URL', function () {
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

    it('shows info for the connection', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2')
        .reply(200, connection2_connected);

      const {stdout} = await runCommand(Cmd, ['my-org-2', '--app=my-app']);

      const output = stripAnsi(stdout);
      expect(output).to.contain('my-org-2 on app my-app');
      expect(output).to.contain('ID');
      expect(output).to.contain('5551fe92-c2fb-4ef7-be43-9d927d9a5c53');
      expect(output).to.contain('Instance URL');
      expect(output).to.contain('https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com');
      expect(output).to.contain('Org ID');
      expect(output).to.contain('00DSG000007a3BcA84');
      expect(output).to.contain('Status');
      expect(output).to.contain('Connected');
      expect(output).to.contain('Connection Type');
      expect(output).to.contain('Salesforce Org');
      expect(output).to.contain('Created Date');
      expect(output).to.contain('2021-01-01T00:00:00Z');
      expect(output).to.contain('Created By');
      expect(output).to.contain('user@example.com');
    });

    it('shows error when connection not found', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2')
        .reply(404, {id: 'record_not_found', message: 'record not found'});

      const {error} = await runCommand(Cmd, ['my-org-2', '--app=my-app']);

      expect(stripAnsi(error?.message || '')).to.contain("my-org-2 doesn't exist on app my-app");
    });
  });
});
