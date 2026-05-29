import { expect } from 'chai';
import nock from 'nock';
import { stderr, stdout } from 'stdout-stderr';
import heredoc from 'tsheredoc';
import { runCommand } from '../../../run-command';
import Cmd from '../../../../src/commands/applink/connections/info';
import stripAnsi from '../../../helpers/strip-ansi';
import {
  addon,
  connection2_connected,
  connection_record_not_found,
  sso_response,
  app,
  addonAttachment,
} from '../../../helpers/fixtures';
import { CLIError } from '@oclif/core/lib/errors';

describe('applink:connections:info', function () {
  let api: nock.Scope;
  let applinkApi: nock.Scope;
  const { env } = process;

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
        .get(
          '/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2'
        )
        .reply(200, connection2_connected);

      await runCommand(Cmd, ['my-org-2', '--app=my-app']);

      expect(stripAnsi(stdout.output)).to.equal(heredoc`
        === my-org-2 on app my-app

        Connection Type:  Salesforce Org
        Created By:       user@example.com
        Created Date:     2021-01-01T00:00:00Z
        Id:               5551fe92-c2fb-4ef7-be43-9d927d9a5c53
        Instance URL:     https://dsg000007a3bca84.test1.my.pc-rnd.salesforce.com
        Last Modified:    2021-01-01T00:00:00Z
        Last Modified By: user@example.com
        Org ID:           00DSG000007a3BcA84
        Status:           Connected
      `);
      expect(stderr.output).to.equal('');
    });

    it('connection not found', async function () {
      applinkApi
        .get(
          '/addons/01234567-89ab-cdef-0123-456789abcdef/connections/my-org-2'
        )
        .reply(200, connection_record_not_found);

      try {
        await runCommand(Cmd, ['my-org-2', '--app=my-app']);
      } catch (error) {
        const { message, oclif } = error as CLIError;
        expect(stripAnsi(message)).to.contain(
          'not found or is not connected to'
        );
        expect(oclif.exit).to.equal(1);
      }
    });
  });
});
