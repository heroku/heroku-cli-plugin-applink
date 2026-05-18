import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {styledHeader, styledObject} from '@heroku/heroku-cli-util/hux';
import {Args} from '@oclif/core';
import {ux} from '@oclif/core/ux';

import * as AppLink from '../../../lib/applink/types.js';
import AppLinkCommand from '../../../lib/base.js';
import {humanize} from '../../../lib/helpers.js';

export default class Info extends AppLinkCommand {
  static args = {
    connection_name: Args.string({
      description: 'name of the connected org',
      required: true,
    }),
  };
  static description = 'show info for a Heroku AppLink connection';
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({required: true}),
    remote: flags.remote(),
  };

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Info);
    const {addon, app} = flags;
    const {connection_name: connectionName} = args;

    await this.configureAppLinkClient(app, addon);
    let connection: AppLink.Connection;
    try {
      ({body: connection} = await this.applinkClient.get<AppLink.Connection>(
        `/addons/${this.addonId}/connections/${connectionName}`,
        {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        },
      ));
    } catch (error) {
      const connErr = error as AppLink.ConnectionError;
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(
          `${color.yellow(connectionName)} doesn't exist on app ${color.app(app)}. Use ${color.command('heroku applink:connections')} to list the connections on the app.`,
          {exit: 1},
        );
      } else {
        throw error;
      }
    }

    const orgInfo = connection!.org;

    styledHeader(`${color.yellow(connectionName)} on app ${color.app(app)}`);

    styledObject({
      'Connection Type': humanize(AppLink.adjustOrgType(connection!.org.type)),
      'Created By': connection!.created_by,
      'Created Date': connection!.created_at,
      Id: connection!.id,
      'Instance URL': orgInfo.instance_url,
      'Last Modified': connection!.last_modified_at,
      'Last Modified By': connection!.last_modified_by,
      'Org ID': orgInfo.id,
      Status: humanize(connection!.status),
    });
  }
}
