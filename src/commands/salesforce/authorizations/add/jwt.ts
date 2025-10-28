import Command from '../../../../lib/base';
import { flags } from '@heroku-cli/command';
import * as AppLink from '../../../../lib/applink/types';
import fs from 'fs';
import { ux, Args } from '@oclif/core';
import { humanize } from '../../../../lib/helpers';
import heredoc from 'tsheredoc';
import { color } from '@heroku-cli/color';

/**
 * Store JWT credentials for Salesforce org authorization.
 *
 * This command uses JWT Bearer Token Flow for headless authentication,
 * suitable for CI/CD pipelines and automated workflows.
 *
 * @see https://devcenter.heroku.com/articles/heroku-applink
 */
export default class JWT extends Command {
  static description =
    'store credentials for connecting a Salesforce org to a Heroku app using JWT authorization';

  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({ required: true }),
    'client-id': flags.string({
      required: true,
      description: 'ID of consumer key',
    }),
    'jwt-key-file': flags.file({
      required: true,
      description: 'path to file containing private key to authorize with',
    }),
    'login-url': flags.string({
      char: 'l',
      description: 'Salesforce login URL',
    }),
    remote: flags.remote(),
    username: flags.string({
      required: true,
      description: 'Salesforce username',
    }),
    alias: flags.string({
      description:
        'alias for the authorization (defaults to applink:{developer_name})',
    }),
  };

  static args = {
    developer_name: Args.string({
      description:
        "unique developer name for the authorization. Must begin with a letter, end with a letter or a number, and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.",
      required: true,
    }),
  };

  static examples = [
    heredoc`
      $ heroku salesforce:authorizations:add:jwt my-auth \\
        --app my-app \\
        --client-id 3MVG9...NM0ZqZc9aT \\
        --jwt-key-file server.key \\
        --username api.user@mycompany.com
    `,
    heredoc`
      $ heroku salesforce:authorizations:add:jwt my-sandbox-auth \\
        --app my-app \\
        --client-id 3MVG9...NM0ZqZc9aT \\
        --jwt-key-file server.key \\
        --username api.user@mycompany.com \\
        --login-url https://test.salesforce.com
    `,
    heredoc`
      $ heroku salesforce:authorizations:add:jwt my-auth \\
        --app my-app \\
        --client-id 3MVG9...NM0ZqZc9aT \\
        --jwt-key-file server.key \\
        --username api.user@mycompany.com \\
        --alias custom-alias
    `,
  ];

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(JWT);
    const {
      addon,
      app,
      'client-id': clientId,
      'jwt-key-file': jwtKeyFile,
      username,
      'login-url': loginUrl,
      alias,
    } = flags;
    const { developer_name: developerName } = args;
    const keyFileContents = fs.readFileSync(jwtKeyFile).toString();
    const authAlias = alias || `applink:${developerName}`;

    await this.configureAppLinkClient(app, addon);

    ux.action.start(
      `Adding credentials for ${username} to ${color.app(app)} as ${color.yellow(developerName)}`
    );

    try {
      const { body: authorization } =
        await this.applinkClient.post<AppLink.Authorization>(
          `/addons/${this.addonId}/authorizations/salesforce/jwt`,
          {
            headers: { authorization: `Bearer ${this._applinkToken}` },
            body: {
              login_url: loginUrl,
              developer_name: developerName,
              client_id: clientId,
              jwt_private_key: keyFileContents,
              username,
              alias: authAlias,
            },
            retryAuth: false,
          }
        );

      ux.action.stop(humanize(authorization.status));
    } catch (error: unknown) {
      ux.action.stop('Failed');

      // Note: Enhanced error handling with user-friendly messages will be
      // implemented in Work Item 2.2 (Common Error Handling Utility).
      // For now, we re-throw the error to let oclif handle it.
      throw error;
    }
  }
}
