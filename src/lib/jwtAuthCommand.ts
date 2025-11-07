import Command from './base';
import { flags } from '@heroku-cli/command';
import * as AppLink from './applink/types';
import fs from 'fs';
import { ux, Args } from '@oclif/core';
import { humanize } from './helpers';
import heredoc from 'tsheredoc';
import { color } from '@heroku-cli/color';

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
 *   protected get commandName(): string { return 'myprovider:authorizations:add:jwt'; }
 *   static examples = new JWT().getExamples();
 * }
 * ```
 */
export default abstract class JWTAuthCommand extends Command {
  /**
   * Provider name for API endpoint (e.g., 'salesforce', 'datacloud')
   * Used in the API path: `/addons/{id}/authorizations/{providerName}/jwt`
   */
  protected abstract get providerName(): string;

  /**
   * Display name for provider (e.g., 'Salesforce', 'Data Cloud')
   * Used in flag descriptions and user-facing messages
   */
  protected abstract get providerDisplayName(): string;

  /**
   * Command name for examples (e.g., 'salesforce:authorizations:add:jwt')
   * Used to generate provider-specific example commands
   */
  protected abstract get commandName(): string;

  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({ required: true }),
    'client-id': flags.string({
      required: true,
      description: 'ID of consumer key from your connected app',
    }),
    'jwt-key-file': flags.file({
      required: true,
      description:
        'path to file containing RSA private key in PEM format to authorize with',
    }),
    'login-url': flags.string({
      char: 'l',
      description: 'Salesforce login URL',
    }),
    remote: flags.remote(),
    username: flags.string({
      required: true,
      description: 'Salesforce username authorized for the connected app',
    }),
    alias: flags.string({
      description:
        '[default: applink:{developer_name}] alias for authorization to retrieve credentials via SDK',
    }),
  };

  static args = {
    developer_name: Args.string({
      description:
        "unique developer name for the authorization. Must begin with a letter, end with a letter or a number, and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.",
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

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(
      this.constructor as typeof JWTAuthCommand
    );
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
          `/addons/${this.addonId}/authorizations/${this.providerName}/jwt`,
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
