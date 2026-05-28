import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';
import {ChildProcess} from 'node:child_process';
import sinon, {SinonSandbox, SinonStub} from 'sinon';

import Cmd from '../../../../src/commands/datacloud/authorizations/add.js';
import {
  addon,
  addonAttachment,
  app,
  authorization_authenticating,
  authorization_connected,
  authorization_connection_failed,
  authorization_disconnected,
  sso_response,
} from '../../../helpers/fixtures.js';
import stripAnsi from '../../../helpers/strip-ansi.js';

describe('datacloud:authorizations:add', function () {
  let api: nock.Scope;
  let applinkApi: nock.Scope;
  const {env} = process;
  let sandbox: SinonSandbox;
  let urlOpener: SinonStub;

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

  context('when the user accepts the prompt to open the browser', function () {
    beforeEach(function () {
      urlOpener = sandbox
        .stub(Cmd, 'urlOpener')
        .onFirstCall()
        .resolves({
          on(_: string, _cb: (_err: Error) => void) {},
        } as unknown as ChildProcess);
      sandbox.stub(Cmd, 'anykeyHandler').resolves('');
      applinkApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/datacloud')
        .reply(202, authorization_authenticating);
    });

    context('when the authorization succeeds', function () {
      beforeEach(function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/5551fe92-c2fb-4ef7-be43-9d927d9a5c53')
          .reply(200, authorization_connected);
      });

      it('shows the URL that will be opened for the OAuth flow', async function () {
        const {stderr} = await runCommand(Cmd, ['my-auth-1', '--app=my-app']);

        expect(stderr).to.contain(`Opening browser to ${authorization_authenticating.redirect_uri}`);
      });

      it('attempts to open the browser to the redirect URI', async function () {
        await runCommand(Cmd, ['my-auth-1', '--app=my-app']);

        expect(urlOpener.calledWith(authorization_authenticating.redirect_uri, {
          wait: false,
        })).to.equal(true);
      });

      it('shows the expected output after connecting', async function () {
        const {stderr} = await runCommand(Cmd, ['my-auth-1', '--app=my-app']);

        expect(stripAnsi(stderr)).to.contain('Adding credentials to my-app as my-auth-1');
        expect(stripAnsi(stderr)).to.contain('Authorized');
      });
    });

    context('when the authorization fails', function () {
      it('completes polling when authorization status is disconnected', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/5551fe92-c2fb-4ef7-be43-9d927d9a5c53')
          .reply(200, authorization_connection_failed);

        const {error} = await runCommand(Cmd, ['my-auth-1', '--app=my-app']);

        expect(error).to.not.exist;
      });

      it('completes polling when authorization is disconnected without error', async function () {
        applinkApi
          .get('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/5551fe92-c2fb-4ef7-be43-9d927d9a5c53')
          .reply(200, authorization_disconnected);

        const {error} = await runCommand(Cmd, ['my-auth-1', '--app=my-app']);

        expect(error).to.not.exist;
      });
    });
  });

  context('when the user rejects the prompt to open the browser', function () {
    beforeEach(function () {
      urlOpener = sandbox.stub(Cmd, 'urlOpener');
      sandbox.stub(Cmd, 'anykeyHandler').rejects(new Error('quit'));
      applinkApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/datacloud')
        .reply(202, authorization_authenticating);
    });

    it("doesn't attempt to open the browser to the redirect URI", async function () {
      await runCommand(Cmd, ['my-auth-1', '--app=my-app']);

      expect(urlOpener.notCalled).to.equal(true);
    });
  });

  context('when the --url flag is provided', function () {
    let anykeyStub: SinonStub;

    beforeEach(function () {
      urlOpener = sandbox.stub(Cmd, 'urlOpener');
      anykeyStub = sandbox.stub(Cmd, 'anykeyHandler');
      applinkApi
        .post('/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/datacloud')
        .reply(202, authorization_authenticating);
    });

    it('outputs the redirect URI', async function () {
      const {stdout} = await runCommand(Cmd, [
        'my-auth-1',
        '--app=my-app',
        '--url',
      ]);

      expect(stdout).to.contain(authorization_authenticating.redirect_uri!);
    });

    it("doesn't prompt the user to open the browser", async function () {
      await runCommand(Cmd, ['my-auth-1', '--app=my-app', '--url']);

      expect(anykeyStub.notCalled).to.equal(true);
    });

    it("doesn't attempt to open the browser", async function () {
      await runCommand(Cmd, ['my-auth-1', '--app=my-app', '--url']);

      expect(urlOpener.notCalled).to.equal(true);
    });
  });
});
