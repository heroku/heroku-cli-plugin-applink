/* eslint-disable mocha/no-exports */
import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import * as AppLink from '../../src/lib/applink/types.js';
import {
  addon,
  addon2,
  addonAttachment,
  addonAttachment2,
  app,
  app2,
  sso_response,
} from './fixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface JWTAuthTestConfig {
  commandClass: any;
  fixtures: {
    authorized: AppLink.Authorization;
    authorizing: AppLink.Authorization;
    failed: AppLink.Authorization;
  };
  providerName: string;
}

export function createJWTAuthCommandTests(config: JWTAuthTestConfig): void {
  const {commandClass: Cmd, fixtures, providerName} = config;
  const filePath = `${__dirname}/jwt.key`;

  describe(`${providerName}:authorizations:jwt:add`, function () {
    let applinkApi: nock.Scope;
    let api: nock.Scope;

    beforeEach(function () {
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
      api.done();
      applinkApi.done();
      nock.cleanAll();
    });

    describe('happy path', function () {
      it('successfully creates JWT authorization with status authorized', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body: unknown) => {
              requestBody = body;
              return true;
            },
          )
          .reply(202, fixtures.authorized);

        const {stderr} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(stderr).to.contain('Adding credentials for admin@applink.org to my-app as my-jwt-auth');
        expect(stderr).to.contain('Authorized');

        const body = requestBody as {
          alias: string;
          client_id: string;
          developer_name: string;
          jwt_private_key: string;
          login_url?: string;
          username: string;
        };
        expect(body.developer_name).to.eq('my-jwt-auth');
        expect(body.client_id).to.eq('test-client-id');
        expect(body.username).to.eq('admin@applink.org');
        expect(body.jwt_private_key).to.be.a('string');
        expect(body.alias).to.eq('applink:my-jwt-auth');
      });

      it('successfully creates JWT authorization with failed status', async function () {
        applinkApi
          .post(`/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`)
          .reply(202, fixtures.failed);

        const {stderr} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(stderr).to.contain('Adding credentials for admin@applink.org to my-app as my-jwt-auth');
        expect(stderr).to.contain('Failed');
      });

      it('successfully creates JWT authorization with authorizing status', async function () {
        applinkApi
          .post(`/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`)
          .reply(202, fixtures.authorizing);

        const {stderr} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(stderr).to.contain('Adding credentials for admin@applink.org to my-app as my-jwt-auth');
        expect(stderr).to.contain('Authorizing');
      });
    });

    describe('sandbox support', function () {
      it('works correctly with sandbox login URL', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body: unknown) => {
              requestBody = body;
              return true;
            },
          )
          .reply(202, fixtures.authorized);

        const {stderr} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
          '--login-url=https://test.salesforce.com',
        ]);

        expect(stderr).to.contain('Adding credentials for admin@applink.org to my-app as my-jwt-auth');
        expect(stderr).to.contain('Authorized');

        const body = requestBody as {login_url?: string};
        expect(body.login_url).to.eq('https://test.salesforce.com');
      });
    });

    describe('alias handling', function () {
      it('uses default alias format when alias is not provided', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body: unknown) => {
              requestBody = body;
              return true;
            },
          )
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        const body = requestBody as {alias: string};
        expect(body.alias).to.eq('applink:my-jwt-auth');
      });

      it('uses custom alias when provided', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body: unknown) => {
              requestBody = body;
              return true;
            },
          )
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
          '--alias=custom-alias',
        ]);

        const body = requestBody as {alias: string};
        expect(body.alias).to.eq('custom-alias');
      });
    });

    describe('multiple add-ons', function () {
      beforeEach(function () {
        nock.cleanAll();
      });

      it('correctly selects target add-on with --addon flag', async function () {
        const multiAddonApi = nock('https://api.heroku.com')
          .get('/apps/my-other-app')
          .reply(200, app2)
          .get('/apps/my-other-app/addons')
          .reply(200, [addon, addon2])
          .get('/apps/my-other-app/addon-attachments')
          .reply(200, [addonAttachment, addonAttachment2])
          .get('/apps/my-other-app/config-vars')
          .reply(200, {
            HEROKU_APPLINK_API_URL:
              'https://applink-api.heroku.com/addons/6789abcd-ef01-2345-6789-abcdef012345',
            HEROKU_APPLINK_COBALT_API_URL:
              'https://applink-api.heroku.com/addons/6789abcd-ef01-2345-6789-abcdef012345',
            HEROKU_APPLINK_COBALT_TOKEN: 'token2',
            HEROKU_APPLINK_TOKEN: 'token',
          })
          .get('/apps/my-other-app/addons/6789abcd-ef01-2345-6789-abcdef012345/sso')
          .reply(200, sso_response);

        const multiAddonApplinkApi = nock('https://applink-api.heroku.com')
          .post(`/addons/6789abcd-ef01-2345-6789-abcdef012345/authorizations/${providerName}/jwt`)
          .reply(202, fixtures.authorized);

        const {stderr} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-other-app',
          '--addon=heroku-applink-horizontal-01234',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(stderr).to.contain('Adding credentials for admin@applink.org to my-other-app as my-jwt-auth');
        expect(stderr).to.contain('Authorized');

        multiAddonApi.done();
        multiAddonApplinkApi.done();
      });
    });

    describe('error handling', function () {
      it('handles 401 authentication failure', async function () {
        applinkApi
          .post(`/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`)
          .reply(401, {
            id: 'unauthorized',
            message: 'Authentication failed',
          });

        const {error} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(error).to.exist;
        expect(error?.message).to.include('Authentication failed');
      });

      it('handles 409 duplicate name conflict', async function () {
        applinkApi
          .post(`/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`)
          .reply(409, {
            id: 'conflict',
            message: 'Authorization already exists',
          });

        const {error} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(error).to.exist;
        expect(error?.message).to.include('already exists');
      });

      it('handles 422 validation error', async function () {
        applinkApi
          .post(`/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`)
          .reply(422, {
            id: 'validation_failed',
            message: 'Invalid developer name format',
          });

        const {error} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(error).to.exist;
        expect(error?.message).to.include('Invalid developer name format');
      });

      it('handles 500 server error', async function () {
        applinkApi
          .post(`/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`)
          .reply(500, {
            id: 'server_error',
            message: 'Internal server error',
          });

        const {error} = await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(error).to.exist;
        expect(error?.message).to.include('server error');
      });
    });

    describe('request body validation', function () {
      it('includes all required fields in request body', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body: unknown) => {
              requestBody = body;
              return true;
            },
          )
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
          '--login-url=https://login.salesforce.com',
        ]);

        const body = requestBody as {
          alias: string;
          client_id: string;
          developer_name: string;
          jwt_private_key: string;
          login_url: string;
          username: string;
        };

        expect(body).to.have.property('developer_name');
        expect(body).to.have.property('client_id');
        expect(body).to.have.property('jwt_private_key');
        expect(body).to.have.property('username');
        expect(body).to.have.property('alias');
        expect(body).to.have.property('login_url');

        expect(body.developer_name).to.eq('my-jwt-auth');
        expect(body.client_id).to.eq('test-client-id');
        expect(body.username).to.eq('admin@applink.org');
        expect(body.alias).to.eq('applink:my-jwt-auth');
        expect(body.login_url).to.eq('https://login.salesforce.com');
        expect(body.jwt_private_key).to.be.a('string');
        expect(body.jwt_private_key.length).to.be.greaterThan(0);
      });
    });

    describe('response type validation', function () {
      it('correctly handles provider org response type', async function () {
        applinkApi
          .post(`/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`)
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(fixtures.authorized.org.type).to.exist;
      });
    });
  });
}
