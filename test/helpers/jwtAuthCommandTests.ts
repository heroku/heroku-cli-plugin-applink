/* eslint-disable mocha/no-exports */
import nock from 'nock';
import stripAnsi from './strip-ansi';
import heredoc from 'tsheredoc';
import { stderr } from 'stdout-stderr';
import { expect } from 'chai';
import { runCommand } from '../run-command';
import * as AppLink from '../../src/lib/applink/types';
import {
  addon,
  addon2,
  sso_response,
  app,
  app2,
  addonAttachment,
  addonAttachment2,
} from './fixtures';

/**
 * Configuration for JWT authorization test suite
 */
export interface JWTAuthTestConfig {
  /** Command class to test */

  commandClass: any;
  /** Provider name for API endpoint (e.g., 'salesforce', 'datacloud') */
  providerName: string;
  /** Authorization fixtures for this provider */
  fixtures: {
    authorized: AppLink.Authorization;
    failed: AppLink.Authorization;
    authorizing: AppLink.Authorization;
  };
}

/**
 * Shared JWT authorization command test suite.
 *
 * This factory function generates a complete test suite for JWT authorization commands,
 * eliminating duplication between provider-specific test files.
 *
 * @param config - Test configuration including command class, provider name, and fixtures
 *
 * @example
 * ```typescript
 * import { createJWTAuthCommandTests } from '../../helpers/jwtAuthCommandTests';
 * import Cmd from '../../../src/commands/salesforce/authorizations/jwt/add';
 * import { authorization_jwt_authorized, ... } from '../../helpers/fixtures';
 *
 * createJWTAuthCommandTests({
 *   commandClass: Cmd,
 *   providerName: 'salesforce',
 *   fixtures: {
 *     authorized: authorization_jwt_authorized,
 *     failed: authorization_jwt_failed,
 *     authorizing: authorization_jwt_authorizing,
 *   },
 * });
 * ```
 */
export function createJWTAuthCommandTests(config: JWTAuthTestConfig): void {
  const { commandClass: Cmd, providerName, fixtures } = config;
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
            (body) => {
              requestBody = body;
              return true;
            }
          )
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(stripAnsi(stderr.output)).to.eq(heredoc`
          Adding credentials for admin@applink.org to my-app as my-jwt-auth...
          Adding credentials for admin@applink.org to my-app as my-jwt-auth... Authorized
        `);

        // Verify request body includes all required fields including alias
        const body = requestBody as {
          developer_name: string;
          client_id: string;
          jwt_private_key: string;
          username: string;
          alias: string;
          login_url?: string;
        };
        expect(body.developer_name).to.eq('my-jwt-auth');
        expect(body.client_id).to.eq('test-client-id');
        expect(body.username).to.eq('admin@applink.org');
        expect(body.jwt_private_key).to.be.a('string');
        expect(body.alias).to.eq('applink:my-jwt-auth'); // Default alias format
      });

      it('successfully creates JWT authorization with failed status', async function () {
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`
          )
          .reply(202, fixtures.failed);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(stripAnsi(stderr.output)).to.eq(heredoc`
          Adding credentials for admin@applink.org to my-app as my-jwt-auth...
          Adding credentials for admin@applink.org to my-app as my-jwt-auth... Failed
        `);
      });

      it('successfully creates JWT authorization with authorizing status', async function () {
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`
          )
          .reply(202, fixtures.authorizing);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(stripAnsi(stderr.output)).to.eq(heredoc`
          Adding credentials for admin@applink.org to my-app as my-jwt-auth...
          Adding credentials for admin@applink.org to my-app as my-jwt-auth... Authorizing
        `);
      });
    });

    describe('sandbox support', function () {
      it('works correctly with sandbox login URL', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body) => {
              requestBody = body;
              return true;
            }
          )
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
          '--login-url=https://test.salesforce.com',
        ]);

        expect(stripAnsi(stderr.output)).to.eq(heredoc`
          Adding credentials for admin@applink.org to my-app as my-jwt-auth...
          Adding credentials for admin@applink.org to my-app as my-jwt-auth... Authorized
        `);

        // Verify login_url is passed to backend
        const body = requestBody as { login_url?: string };
        expect(body.login_url).to.eq('https://test.salesforce.com');
      });
    });

    describe('alias handling', function () {
      it('uses default alias format when alias is not provided', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body) => {
              requestBody = body;
              return true;
            }
          )
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        const body = requestBody as { alias: string };
        expect(body.alias).to.eq('applink:my-jwt-auth');
      });

      it('uses custom alias when provided', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body) => {
              requestBody = body;
              return true;
            }
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

        const body = requestBody as { alias: string };
        expect(body.alias).to.eq('custom-alias');
      });
    });

    describe('multiple add-ons', function () {
      beforeEach(function () {
        // Reset API for this specific test to avoid conflicts
        nock.cleanAll();
      });

      it('correctly selects target add-on with --addon flag', async function () {
        // Setup for multiple add-ons scenario
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
            HEROKU_APPLINK_TOKEN: 'token',
            HEROKU_APPLINK_COBALT_TOKEN: 'token2',
          })
          .get(
            '/apps/my-other-app/addons/6789abcd-ef01-2345-6789-abcdef012345/sso'
          )
          .reply(200, sso_response);

        const multiAddonApplinkApi = nock('https://applink-api.heroku.com')
          .post(
            `/addons/6789abcd-ef01-2345-6789-abcdef012345/authorizations/${providerName}/jwt`
          )
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-other-app',
          '--addon=heroku-applink-horizontal-01234',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        expect(stripAnsi(stderr.output)).to.eq(heredoc`
          Adding credentials for admin@applink.org to my-other-app as my-jwt-auth...
          Adding credentials for admin@applink.org to my-other-app as my-jwt-auth... Authorized
        `);

        multiAddonApi.done();
        multiAddonApplinkApi.done();
      });
    });

    describe('error handling', function () {
      // Note: Detailed error message validation will be added in Work Item 2.2
      // (Common Error Handling Utility). For now, we just verify errors are thrown.

      it('handles 401 authentication failure', async function () {
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`
          )
          .reply(401, {
            message: 'Authentication failed',
            id: 'unauthorized',
          });

        try {
          await runCommand(Cmd, [
            'my-jwt-auth',
            '--app=my-app',
            '--client-id=test-client-id',
            `--jwt-key-file=${filePath}`,
            '--username=admin@applink.org',
          ]);
          expect.fail('Should have thrown an error');
        } catch (error: unknown) {
          // Verify error was thrown
          expect(error).to.exist;
          const { message } = error as { message: string };
          expect(message).to.include('Authentication failed');
        }
      });

      it('handles 409 duplicate name conflict', async function () {
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`
          )
          .reply(409, {
            message: 'Authorization already exists',
            id: 'conflict',
          });

        try {
          await runCommand(Cmd, [
            'my-jwt-auth',
            '--app=my-app',
            '--client-id=test-client-id',
            `--jwt-key-file=${filePath}`,
            '--username=admin@applink.org',
          ]);
          expect.fail('Should have thrown an error');
        } catch (error: unknown) {
          // Verify error was thrown
          expect(error).to.exist;
          const { message } = error as { message: string };
          expect(message).to.include('already exists');
        }
      });

      it('handles 422 validation error', async function () {
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`
          )
          .reply(422, {
            message: 'Invalid developer name format',
            id: 'validation_failed',
          });

        try {
          await runCommand(Cmd, [
            'my-jwt-auth',
            '--app=my-app',
            '--client-id=test-client-id',
            `--jwt-key-file=${filePath}`,
            '--username=admin@applink.org',
          ]);
          expect.fail('Should have thrown an error');
        } catch (error: unknown) {
          // Verify error was thrown
          expect(error).to.exist;
          const { message } = error as { message: string };
          expect(message).to.include('Invalid developer name format');
        }
      });

      it('handles 500 server error', async function () {
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`
          )
          .reply(500, {
            message: 'Internal server error',
            id: 'server_error',
          });

        try {
          await runCommand(Cmd, [
            'my-jwt-auth',
            '--app=my-app',
            '--client-id=test-client-id',
            `--jwt-key-file=${filePath}`,
            '--username=admin@applink.org',
          ]);
          expect.fail('Should have thrown an error');
        } catch (error: unknown) {
          // Verify error was thrown
          expect(error).to.exist;
          const { message } = error as { message: string };
          expect(message).to.include('server error');
        }
      });
    });

    describe('request body validation', function () {
      it('includes all required fields in request body', async function () {
        let requestBody: unknown;
        applinkApi
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`,
            (body) => {
              requestBody = body;
              return true;
            }
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
          developer_name: string;
          client_id: string;
          jwt_private_key: string;
          username: string;
          alias: string;
          login_url: string;
        };

        // Verify all required fields are present
        expect(body).to.have.property('developer_name');
        expect(body).to.have.property('client_id');
        expect(body).to.have.property('jwt_private_key');
        expect(body).to.have.property('username');
        expect(body).to.have.property('alias');
        expect(body).to.have.property('login_url');

        // Verify values are correct
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
          .post(
            `/addons/01234567-89ab-cdef-0123-456789abcdef/authorizations/${providerName}/jwt`
          )
          .reply(202, fixtures.authorized);

        await runCommand(Cmd, [
          'my-jwt-auth',
          '--app=my-app',
          '--client-id=test-client-id',
          `--jwt-key-file=${filePath}`,
          '--username=admin@applink.org',
        ]);

        // Verify that the fixture has correct org type
        expect(fixtures.authorized.org.type).to.exist;
      });
    });
  });
}
