import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';

import Cmd from '../../../src/commands/datacloud/disconnect.js';
import {
  addon,
  addon2,
  addonAttachment,
  addonAttachment2,
  app,
  connection5_disconnecting,
  ConnectionError_record_not_found,
  sso_response,
} from '../../helpers/fixtures.js';
import stripAnsi from '../../helpers/strip-ansi.js';

describe('datacloud:disconnect', function () {
  let api: nock.Scope;
  let applinkApi: nock.Scope;
  const {env} = process;

  context('when config var is set to HEROKU_APPLINK_API_URL', function () {
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

    it('disconnects successfully when no data action targets exist', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, []);
      applinkApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(202, connection5_disconnecting);

      const {stderr} = await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
        '--confirm=myorg',
      ]);

      expect(stderr).to.contain('Disconnected');
    });

    it('disconnects successfully when data action targets exist', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, [
          {
            api_name: 'MyDAT',
            app_id: 'app-1',
            connection_id: 'conn-1',
            id: 'dat-1',
            label: 'My Data Action Target',
            status: 'created',
            target_endpoint: '/handle',
            type: 'webhook',
          },
        ]);
      applinkApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(202, connection5_disconnecting);

      const {stderr} = await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
        '--confirm=myorg',
      ]);

      expect(stderr).to.contain('Disconnected');
    });

    it('connection not found', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, []);
      applinkApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .reply(404, ConnectionError_record_not_found.body);

      const {error} = await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
        '--confirm=myorg',
      ]);

      expect(error).to.exist;
      expect(stripAnsi(error!.message)).to.contain("Data Cloud connection myorg doesn't exist on app my-app.");
    });

    it('errors when the wrong org name is passed to the confirm flag', async function () {
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud/myorg/data_action_targets')
        .reply(200, []);
      applinkApi
        .delete('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/myorg')
        .optionally()
        .reply(202, connection5_disconnecting);

      const {error} = await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
        '--confirm=myorg2',
      ]);

      expect(error).to.exist;
    });
  });

  context('when app has no AppLink add-on', function () {
    beforeEach(function () {
      process.env = {};
      nock('https://api.heroku.com')
        .get('/apps/my-app')
        .reply(200, app)
        .get('/apps/my-app/addons')
        .reply(200, [])
        .get('/apps/my-app/addon-attachments')
        .reply(200, [])
        .get('/apps/my-app/config-vars')
        .reply(200, {});
    });

    afterEach(function () {
      process.env = env;
      nock.cleanAll();
    });

    it('shows an error that AppLink is not installed', async function () {
      const {error} = await runCommand(Cmd, [
        'myorg',
        '--app=my-app',
        '--confirm=myorg',
      ]);

      expect(error).to.exist;
      expect(stripAnsi(error!.message)).to.contain("AppLink add-on isn't present on my-app");
    });
  });

  context(
    'when app has multiple AppLink add-ons without --addon flag',
    function () {
      beforeEach(function () {
        process.env = {};
        nock('https://api.heroku.com')
          .get('/apps/my-app')
          .reply(200, app)
          .get('/apps/my-app/addons')
          .reply(200, [addon, {...addon2, app}])
          .get('/apps/my-app/addon-attachments')
          .reply(200, [addonAttachment, addonAttachment2])
          .get('/apps/my-app/config-vars')
          .reply(200, {
            HEROKU_APPLINK_API_URL:
              'https://applink-api.heroku.com/addons/01234567',
            HEROKU_APPLINK_TOKEN: 'token',
          });
      });

      afterEach(function () {
        process.env = env;
        nock.cleanAll();
      });

      it('shows an error to specify --addon flag', async function () {
        const {error} = await runCommand(Cmd, [
          'myorg',
          '--app=my-app',
          '--confirm=myorg',
        ]);

        expect(error).to.exist;
        expect(stripAnsi(error!.message)).to.contain('multiple AppLink add-ons');
      });
    },
  );
});
