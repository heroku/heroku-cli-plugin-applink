import { color } from '@heroku-cli/color';
import Command from '../../../lib/base';
import { flags } from '@heroku-cli/command';
import * as AppLink from '../../../lib/applink/types';
import { Args, ux } from '@oclif/core';
import { humanize } from '../../../lib/helpers';

export default class Info extends Command {
  static description = 'show info for a Heroku AppLink connection';

  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({ required: true }),
    remote: flags.remote(),
  };

  static args = {
    connection_name: Args.string({
      description: 'name of the connected org',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(Info);
    const { app, addon } = flags;
    const { connection_name: connectionName } = args;

    await this.configureAppLinkClient(app, addon);
    let connection: AppLink.Connection;
    try {
      ({ body: connection } = await this.applinkClient.get<AppLink.Connection>(
        `/addons/${this.addonId}/connections/${connectionName}`,
        {
          headers: { authorization: `Bearer ${this._applinkToken}` },
          retryAuth: false,
        }
      ));
    } catch (error) {
      const connErr = error as AppLink.ConnectionError;
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(
          `${color.yellow(connectionName)} doesn't exist on app ${color.app(app)}. Use ${color.cmd('heroku applink:connections')} to list the connections on the app.`,
          { exit: 1 }
        );
      } else {
        throw error;
      }
    }

    const orgInfo = connection.org;

    ux.styledHeader(`${color.yellow(connectionName)} on app ${color.app(app)}`);

    ux.styledObject({
      Id: connection.id,
      'Instance URL': orgInfo.instance_url,
      'Org ID': orgInfo.id,
      Status: humanize(connection.status),
      'Connection Type': humanize(AppLink.adjustOrgType(connection.org.type)),
      'Created Date': connection.created_at,
      'Created By': connection.created_by,
      'Last Modified': connection.last_modified_at,
      'Last Modified By': connection.last_modified_by,
    });
  }
}
