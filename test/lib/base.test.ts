import {flags} from '@heroku-cli/command';
import {runCommand} from '@heroku-cli/test-utils';
import {expect} from 'chai';
import nock from 'nock';

import * as AppLink from '../../src/lib/applink/types.js';
import BaseCommand from '../../src/lib/base.js';
import {
  addon,
  addon2,
  addonAttachment,
  addonAttachment2,
  addonAttachmentStaging,
  addonStaging,
  app,
  sso_response,
} from '../helpers/fixtures.js';
import stripAnsi from '../helpers/strip-ansi.js';

class CommandWithoutConfiguration extends BaseCommand {
  async run() {
    this.applinkClient.get<Array<AppLink.SalesforceConnection>>(`/addons/${this.addonId}/connections`);
  }
}

class CommandWithConfiguration extends BaseCommand {
  static flags = {
    addon: flags.string(),
    app: flags.app({required: true}),
  };

  async run() {
    const {flags} = await this.parse(CommandWithConfiguration);
    const {addon, app} = flags;
    await this.configureAppLinkClient(app, addon);
    this.applinkClient.get<Array<AppLink.SalesforceConnection>>(`/addons/${this.addonId}/connections`);
  }
}

describe('attempt a request using the applink API client', function () {
  const {env} = process;
  let api: nock.Scope;
  let applinkApi: nock.Scope;

  beforeEach(function () {
    process.env = {HEROKU_API_KEY: 'test-api-key'};
    api = nock('https://api.heroku.com');
    applinkApi = nock('https://applink-api.heroku.com');
  });

  afterEach(function () {
    process.env = env;
    api.done();
    applinkApi.done();
    nock.cleanAll();
  });

  context('when the client wasn’t configured', function () {
    it('returns an error message and exits with a status of 1', async function () {
      const {error, stdout} = await runCommand(CommandWithoutConfiguration, [
        '--app=my-app',
      ]);
      expect(stripAnsi(error?.message || '')).to.contain('AppLink API Client not configured.');
      expect(error?.oclif?.exit).to.equal(1);
      expect(stdout).to.equal('');
    });
  });

  context(
    "when the app doesn't have the Heroku AppLink add-on installed",
    function () {
      beforeEach(function () {
        api
          .get('/apps/my-app')
          .reply(200, app)
          .get('/apps/my-app/addons')
          .reply(200, [])
          .get('/apps/my-app/config-vars')
          .reply(200, {})
          .get('/apps/my-app/addon-attachments')
          .reply(200, []);
      });

      it('returns an error message and exits with a status of 1', async function () {
        const {error, stdout} = await runCommand(CommandWithConfiguration, [
          '--app=my-app',
        ]);
        expect(stripAnsi(error?.message || '')).to.contain("AppLink add-on isn't present on my-app.");
        expect(error?.oclif?.exit).to.equal(1);
        expect(stdout).to.equal('');
      });
    },
  );

  context('when the add-on is not fully provisioned', function () {
    beforeEach(function () {
      api
        .get('/apps/my-app')
        .reply(200, app)
        .get('/apps/my-app/addons')
        .reply(200, [addon])
        .get('/apps/my-app/addon-attachments')
        .reply(200, [addonAttachment])
        .get('/apps/my-app/config-vars')
        .reply(200, {});
    });

    it('returns an error message and exits with a status of 1', async function () {
      const {error, stdout} = await runCommand(CommandWithConfiguration, [
        '--app=my-app',
      ]);
      expect(stripAnsi(error?.message || '')).to.contain("AppLink add-on isn't fully provisioned on my-app.");
      expect(error?.oclif?.exit).to.equal(1);
      expect(stdout).to.equal('');
    });
  });

  context('when the add-on is correctly provisioned', function () {
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
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, []);
    });

    it('makes the request', async function () {
      const {stderr, stdout} = await runCommand(CommandWithConfiguration, [
        '--app=my-app',
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.equal('');
    });
  });

  context('when HEROKU_APPLINK_ADDON is set', function () {
    beforeEach(function () {
      process.env = {
        HEROKU_API_KEY: 'test-api-key',
        HEROKU_APPLINK_ADDON: 'heroku-applink-staging',
      };

      api
        .get('/apps/my-app')
        .reply(200, app)
        .get('/apps/my-app/addons')
        .reply(200, [addonStaging])
        .get('/apps/my-app/addon-attachments')
        .reply(200, [addonAttachmentStaging])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_STAGING_API_URL:
            'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_STAGING_TOKEN: 'token',
        })
        .get('/apps/my-app/addons/6789abcd-ef01-2345-6789-abcdef012345/sso')
        .reply(200, sso_response);
      applinkApi
        .get('/addons/6789abcd-ef01-2345-6789-abcdef012345/connections')
        .reply(200, []);
    });

    it('respects the value of HEROKU_APPLINK_ADDON', async function () {
      const {stderr, stdout} = await runCommand(CommandWithConfiguration, [
        '--app=my-app',
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.equal('');
    });
  });

  context('when the --addon flag is specified', function () {
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
        });
    });

    it('uses the specified add-on name', async function () {
      api
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response);
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, []);

      const {stderr, stdout} = await runCommand(CommandWithConfiguration, [
        '--app=my-app',
        '--addon=heroku-applink-vertical-01234',
      ]);

      expect(stderr).to.equal('');
      expect(stdout).to.equal('');
    });

    it('uses the specified add-on ID', async function () {
      api
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response);
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, []);

      const {stderr, stdout} = await runCommand(CommandWithConfiguration, [
        '--app=my-app',
        '--addon=01234567-89ab-cdef-0123-456789abcdef',
      ]);

      expect(stderr).to.equal('');
      expect(stdout).to.equal('');
    });

    it('returns an error message and exits with a status of 1 if the add-on doesn’t exist', async function () {
      const {error, stdout} = await runCommand(CommandWithConfiguration, [
        '--app=my-app',
        '--addon=my-addon-2',
      ]);
      expect(stripAnsi(error?.message || '')).to.contain("AppLink add-on my-addon-2 doesn't exist on my-app.");
      expect(error?.oclif?.exit).to.equal(1);
      expect(stdout).to.equal('');
    });
  });

  context('when there are multiple AppLink addons', function () {
    beforeEach(function () {
      api
        .get('/apps/my-app')
        .reply(200, app)
        .get('/apps/my-app/addons')
        .reply(200, [addon, addon2])
        .get('/apps/my-app/addon-attachments')
        .reply(200, [addonAttachment, addonAttachment2])
        .get('/apps/my-app/config-vars')
        .reply(200, {
          HEROKU_APPLINK_API_URL:
            'https://applink-api.heroku.com/addons/01234567-89ab-cdef-0123-456789abcdef',
          HEROKU_APPLINK_COBALT_API_URL:
            'https://applink-api.heroku.com/addons/6789abcd-ef01-2345-6789-abcdef012345',
          HEROKU_APPLINK_COBALT_TOKEN: 'token',
          HEROKU_APPLINK_TOKEN: 'token',
        });
    });

    it('uses the specified add-on', async function () {
      api
        .get('/apps/my-app/addons/01234567-89ab-cdef-0123-456789abcdef/sso')
        .reply(200, sso_response);
      applinkApi
        .get('/addons/01234567-89ab-cdef-0123-456789abcdef/connections')
        .reply(200, []);

      const {stderr, stdout} = await runCommand(CommandWithConfiguration, [
        '--app=my-app',
        '--addon=heroku-applink-vertical-01234',
      ]);

      expect(stderr).to.equal('');
      expect(stdout).to.equal('');
    });

    it('returns an error message and exits with a status of 1 if no addon is specified', async function () {
      const {error, stdout} = await runCommand(CommandWithConfiguration, [
        '--app=my-app',
      ]);
      expect(stripAnsi(error?.message || '')).to.contain('Your app my-app has multiple AppLink add-ons.');
      expect(error?.oclif?.exit).to.equal(1);
      expect(stdout).to.equal('');
    });
  });
});
