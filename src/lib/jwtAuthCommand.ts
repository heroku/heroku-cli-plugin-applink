import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {Args} from '@oclif/core';
import {ux} from '@oclif/core/ux';
import fs from 'node:fs';
import tsheredoc from 'tsheredoc';

import * as AppLink from './applink/types.js';
import Command from './base.js';
import {humanize} from './helpers.js';

const heredoc = tsheredoc.default ?? tsheredoc;

/**
 * Base class for JWT authorization commands across providers.
 *
 * Handles common JWT authentication flow for Salesforce, Data Cloud,
 * and other providers. This class eliminates code duplication and
 * ensures consistent behavior across all provider-specific JWT commands.
 *
 * To add a new provider:
 * 1. Extend this class
 * 2. Implement the abstract getters (providerName, providerDisplayName, commandName)
 * 3. Set static description and examples
 *
 * @example
 * ```typescript
 * export default class JWT extends JWTAuthCommand {
 *   static description = 'store credentials for MyProvider...';
 *   protected get providerName(): string { return 'myprovider'; }
 *   protected get providerDisplayName(): string { return 'MyProvider'; }
 *   protected get commandName(): string { return 'myprovider:authorizations:jwt:add'; }
 *   static examples = new JWT().getExamples();
 * }
 * ```
 */
export default abstract class JWTAuthCommand extends Command {
  static args = {
    developer_name: Args.string({
      description:
        'unique developer name for the authorization. Must begin with a letter, '
        + "end with a letter or number, and be 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.",
      required: true,
    }),
  };
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    alias: flags.string({
      description:
        '[default: applink:{developer_name}] alias for authorization to retrieve credentials via SDK',
    }),
    app: flags.app({required: true}),
    'client-id': flags.string({
      description: 'ID of consumer key from your connected app',
      required: true,
    }),
    'jwt-key-file': flags.file({
      description:
        'path to file containing RSA private key in PEM format to authorize with',
      required: true,
    }),
    'login-url': flags.string({
      char: 'l',
      description: 'Salesforce login URL',
    }),
    remote: flags.remote(),
    username: flags.string({
      description: 'Salesforce username authorized for the connected app',
      required: true,
    }),
  };

  /**
   * Generate provider-specific examples.
   * Subclasses should call this static method to generate examples.
   */
  protected static generateExamples(commandName: string): string[] {
    return [
      heredoc`
        $ heroku ${commandName} my-auth \\
          --app my-app \\
          --client-id 3MVG9...NM0ZqZc9aT \\
          --jwt-key-file server.key \\
          --username api.user@mycompany.com
      `,
      heredoc`
        $ heroku ${commandName} my-sandbox-auth \\
          --app my-app \\
          --client-id 3MVG9...NM0ZqZc9aT \\
          --jwt-key-file server.key \\
          --username api.user@mycompany.com \\
          --login-url https://test.salesforce.com
      `,
      heredoc`
        $ heroku ${commandName} my-auth \\
          --app my-app \\
          --client-id 3MVG9...NM0ZqZc9aT \\
          --jwt-key-file server.key \\
          --username api.user@mycompany.com \\
          --alias custom-alias
      `,
    ];
  }

  /**
   * Command name for examples (e.g., 'salesforce:authorizations:jwt:add')
   * Used to generate provider-specific example commands
   */
  protected abstract get commandName(): string;

  /**
   * Display name for provider (e.g., 'Salesforce', 'Data Cloud')
   * Used in flag descriptions and user-facing messages
   */
  protected abstract get providerDisplayName(): string;

  /**
   * Provider name for API endpoint (e.g., 'salesforce', 'datacloud')
   * Used in the API path: `/addons/{id}/authorizations/{providerName}/jwt`
   */
  protected abstract get providerName(): string;

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(this.constructor as typeof JWTAuthCommand);
    const {
      addon,
      alias,
      app,
      'client-id': clientId,
      'jwt-key-file': jwtKeyFile,
      'login-url': loginUrl,
      username,
    } = flags;
    const {developer_name: developerName} = args;
    const keyFileContents = fs.readFileSync(jwtKeyFile).toString();
    const authAlias = alias || `applink:${developerName}`;

    await this.configureAppLinkClient(app, addon);

    ux.action.start(`Adding credentials for ${username} to ${color.app(app)} as ${color.yellow(developerName)}`);

    try {
      const {body: authorization}
        = await this.applinkClient.post<AppLink.Authorization>(
          `/addons/${this.addonId}/authorizations/${this.providerName}/jwt`,
          {
            body: {
              alias: authAlias,
              client_id: clientId,
              developer_name: developerName,
              jwt_private_key: keyFileContents,
              login_url: loginUrl,
              username,
            },
            headers: {authorization: `Bearer ${this._applinkToken}`},
            retryAuth: false,
          },
        );

      ux.action.stop(humanize(authorization.status));
    } catch (error: unknown) {
      ux.action.stop('Failed');
      throw error;
    }
  }
}
