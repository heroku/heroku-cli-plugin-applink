import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';

import Cmd from '../../../../src/commands/applink/connections/index.js';
import {
  addon,
  addonAttachment,
  app,
  connection1,
  connection2_connected,
  connection3_connected_failed,
  sso_response,
} from '../../../helpers/fixtures.js';
import stripAnsi from '../../../helpers/strip-ansi.js';
import removeAllWhitespace from '../../../helpers/utils/remove-whitespaces.js';

describe('applink:connections', function () {
  let api: nock.Scope;
  let applinkApi: nock.Scope;
  const {env} = process;

  beforeEach(function () {
    process.env = {};
    api = nock('https://api.heroku.com');
    applinkApi = nock('https://applink-api.heroku.com');
  });

  afterEach(function () {
    process.env = env;
    api.done();
    applinkApi.done();
    nock.cleanAll();
  });

  context('when the --app flag is specified', function () {
    beforeEach(function () {
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

    context(
      'when there are no Heroku AppLink connections created on the app',
      function () {
        it('displays a notification', async function () {
          applinkApi
            .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
            .reply(200, []);

          const {stdout} = await runCommand(Cmd, ['--app=my-app']);

          expect(stripAnsi(stdout)).to.contain('There are no Heroku AppLink connections for app my-app.');
        });
      },
    );

    context('when there are Heroku AppLink connections returned', function () {
      it('shows the connections', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [connection1, connection2_connected]);

        const {stdout} = await runCommand(Cmd, ['--app=my-app']);

        const actual = removeAllWhitespace(stdout);
        expect(actual).to.include(removeAllWhitespace('Heroku AppLink connections for add-on'));
        expect(actual).to.include(removeAllWhitespace('heroku-applink-vertical-01234 my-org-1 Connected Salesforce Org'));
        expect(actual).to.include(removeAllWhitespace('heroku-applink-vertical-01234 my-org-2 Connected Salesforce Org'));
      });
    });

    context('when Heroku AppLink connections fails to load', function () {
      it('shows failed connection and warning message', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
          .reply(200, [
            connection1,
            connection2_connected,
            connection3_connected_failed,
          ]);

        const {stdout} = await runCommand(Cmd, ['--app=my-app']);

        const actual = removeAllWhitespace(stdout);
        expect(actual).to.include(removeAllWhitespace('my-org-1 Connected'));
        expect(actual).to.include(removeAllWhitespace('my-org-2 Connected'));
        expect(actual).to.include(removeAllWhitespace('my-org-3 Failed'));
        expect(stripAnsi(stdout)).to.contain('You have one or more failed connections.');
      });
    });
  });
});
