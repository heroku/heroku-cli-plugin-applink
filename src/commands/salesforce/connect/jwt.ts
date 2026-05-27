import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {Args} from '@oclif/core';
import {ux} from '@oclif/core/ux';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';

import * as AppLink from '../../../lib/applink/types.js';
import AppLinkCommand from '../../../lib/base.js';
import {humanize} from '../../../lib/helpers.js';

export default class JWT extends AppLinkCommand {
  static args = {
    connection_name: Args.string({
      description:
        'name for the Salesforce connection. Must begin with a letter, end with a letter or a number,'
        + " and be between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.",
      required: true,
    }),
  };
  static description
    = 'connect a Salesforce org to Heroku app using a JWT auth token';
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({required: true}),
    'client-id': flags.string({
      description: 'ID of consumer key',
      required: true,
    }),
    'jwt-key-file': flags.file({
      description: 'path to file containing private key to authorize with',
      required: true,
    }),
    'login-url': flags.string({
      char: 'l',
      description: 'Salesforce login URL',
    }),
    remote: flags.remote(),
    username: flags.string({
      description: 'Salesforce username',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(JWT);
    const {
      addon,
      app,
      'client-id': clientId,
      'jwt-key-file': jwtKeyFile,
      'login-url': loginUrl,
      username,
    } = flags;
    const {connection_name: connectionName} = args;
    const keyFileContents = fs.readFileSync(jwtKeyFile).toString();

    await this.configureAppLinkClient(app, addon);

    ux.action.start(`Adding credentials for ${username} to ${color.app(app)} as ${color.yellow(connectionName)}`);

    const {body: credential}
      = await this.applinkClient.post<AppLink.CredsCredential>(
        `/addons/${this.addonId}/connections/salesforce/jwt`,
        {
          body: {
            alias: randomUUID(),
            client_id: clientId,
            connection_name: connectionName,
            jwt_private_key: keyFileContents,
            login_url: loginUrl,
            username,
          },
          headers: {authorization: `Bearer ${this._applinkToken}`},
        },
      );

    ux.action.stop(humanize(credential.status));
  }
}
