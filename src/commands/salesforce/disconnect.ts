import { color } from '@heroku-cli/color';
import Command from '../../lib/base';
import { flags } from '@heroku-cli/command';
import * as AppLink from '../../lib/applink/types';
import { ux, Args } from '@oclif/core';
import { humanize } from '../../lib/helpers';
import heredoc from 'tsheredoc';
import { ConnectionError } from '../../lib/applink/types';
import confirmCommand from '../../lib/confirmCommand';

export default class Disconnect extends Command {
  static description = 'disconnect a Salesforce org from a Heroku app';

  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({ required: true }),
    confirm: flags.string({
      char: 'c',
      description: 'set to Salesforce connection name to bypass confirm prompt',
    }),
    remote: flags.remote(),
  };

  static args = {
    connection_name: Args.string({
      description:
        'name of the Salesforce connection you would like to disconnect',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(Disconnect);
    const { app, addon, confirm } = flags;
    const { connection_name: connectionName } = args;

    await this.configureAppLinkClient(app, addon);

    await confirmCommand({
      connectionName,
      connectionType: 'connection',
      addon: this._addonName,
      app,
      confirm,
    });

    try {
      await this.applinkClient.delete<AppLink.SalesforceConnection>(
        `/addons/${this.addonId}/connections/${connectionName}`,
        {
          headers: { authorization: `Bearer ${this._applinkToken}` },
          retryAuth: false,
        }
      );
    } catch (error) {
      const connErr = error as ConnectionError;
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(
          heredoc`
            Salesforce connection ${color.yellow(connectionName)} doesn't exist on app ${color.app(app)}.
            Use ${color.cmd(`heroku applink:connections --app ${app}`)} to list the connections on the app`,
          { exit: 1 }
        );
      } else {
        throw error;
      }
    }

    ux.action.start(
      `Disconnecting Salesforce connection ${color.yellow(connectionName)} from ${color.app(app)}`
    );
    ux.action.stop(humanize('Disconnected'));
  }
}
