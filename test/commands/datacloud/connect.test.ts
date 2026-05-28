import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';
import {ChildProcess} from 'node:child_process';
import sinon, {SinonSandbox, SinonStub} from 'sinon';

import Cmd from '../../../src/commands/datacloud/connect.js';
import {
  addon,
  addonAttachment,
  app,
  connection4_connected,
  connection4_connecting,
  connection4_disconnected,
  connection4_failed,
  sso_response,
} from '../../helpers/fixtures.js';
import stripAnsi from '../../helpers/strip-ansi.js';

describe('datacloud:connect', function () {
  let api: nock.Scope;
  const {env} = process;
  let sandbox: SinonSandbox;
  let urlOpener: SinonStub;

  context('when config var is set to HEROKU_APPLINK_API_URL', function () {
    let applinkApi: nock.Scope;

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
      sandbox = sinon.createSandbox();
    });

    afterEach(function () {
      process.env = env;
      api.done();
      applinkApi.done();
      nock.cleanAll();
      sandbox.restore();
    });

    context(
      'when the user accepts the prompt to open the browser',
      function () {
        beforeEach(function () {
          urlOpener = sandbox
            .stub(Cmd, 'urlOpener')
            .onFirstCall()
            .resolves({
              on(_: string, _cb: (_err: Error) => void) {},
            } as unknown as ChildProcess);
          sandbox.stub(Cmd, 'anykeyHandler').resolves('');
          applinkApi
            .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud')
            .reply(202, connection4_connecting);
        });

        context('when the connection succeeds', function () {
          beforeEach(function () {
            applinkApi
              .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/339b373a-5d0c-4056-bfdd-47a06b79f112')
              .reply(200, connection4_connected);
          });

          it('shows the URL that will be opened for the OAuth flow', async function () {
            const {stderr} = await runCommand(Cmd, [
              'my-org-2',
              '--app=my-app',
            ]);

            expect(stderr).to.contain(`Opening browser to ${connection4_connecting.redirect_uri}`);
          });

          it('attempts to open the browser to the redirect URI', async function () {
            await runCommand(Cmd, ['my-org-2', '--app=my-app']);

            expect(urlOpener.calledWith(connection4_connecting.redirect_uri, {
              wait: false,
            })).to.equal(true);
          });

          it('shows the expected output after connecting', async function () {
            const {stderr} = await runCommand(Cmd, [
              'my-org-2',
              '--app=my-app',
            ]);

            expect(stripAnsi(stderr)).to.contain('Connecting Data Cloud org to my-app as my-org-2');
            expect(stripAnsi(stderr)).to.contain('Connected');
          });
        });

        context('when the connection fails', function () {
          it('completes polling when connection fails', async function () {
            applinkApi
              .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/339b373a-5d0c-4056-bfdd-47a06b79f112')
              .reply(200, connection4_failed);

            const {error} = await runCommand(Cmd, [
              'my-org-2',
              '--app=my-app',
            ]);

            expect(error).to.not.exist;
          });

          it('completes polling when connection is disconnected', async function () {
            applinkApi
              .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/339b373a-5d0c-4056-bfdd-47a06b79f112')
              .reply(200, connection4_disconnected);

            const {error} = await runCommand(Cmd, [
              'my-org-2',
              '--app=my-app',
            ]);

            expect(error).to.not.exist;
          });
        });
      },
    );

    context(
      'when the user rejects the prompt to open the browser',
      function () {
        beforeEach(function () {
          urlOpener = sandbox.stub(Cmd, 'urlOpener');
          sandbox.stub(Cmd, 'anykeyHandler').rejects(new Error('quit'));
          applinkApi
            .post('/addons/01234567-89ab-cdef-0123-456789abcdef/connections/datacloud')
            .reply(202, connection4_connecting);
        });

        it("doesn't attempt to open the browser to the redirect URI", async function () {
          await runCommand(Cmd, ['my-org-2', '--app=my-app']);

          expect(urlOpener.notCalled).to.equal(true);
        });
      },
    );
  });
});
