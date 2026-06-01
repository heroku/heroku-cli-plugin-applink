import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {confirmCommand} from '@heroku/heroku-cli-util/hux';
import {Args} from '@oclif/core';
import {ux} from '@oclif/core/ux';
import tsheredoc from 'tsheredoc';

import * as AppLink from '../../lib/applink/types.js';
import AppLinkCommand from '../../lib/base.js';
import {humanize} from '../../lib/helpers.js';

const heredoc = tsheredoc.default ?? tsheredoc;

export default class Disconnect extends AppLinkCommand {
  static args = {
    connection_name: Args.string({
      description: 'name of the Data Cloud connection',
      required: true,
    }),
  };
  static description = 'disconnect a Data Cloud org from a Heroku app';
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({required: true}),
    confirm: flags.string({
      char: 'c',
      description:
        'set to Data Cloud org connection name to bypass confirm prompt',
    }),
    remote: flags.remote(),
  };

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Disconnect);
    const {addon, app, confirm} = flags;
    const {connection_name: connectionName} = args;

    await this.configureAppLinkClient(app, addon);

    let dataActionTargets: AppLink.DataActionTarget[] = [];

    try {
      const {body} = await this.applinkClient.get<AppLink.DataActionTarget[]>(
        `/addons/${this.addonId}/connections/datacloud/${connectionName}/data_action_targets`,
        {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        },
      );
      dataActionTargets = body || [];
    } catch {
      ux.error('Failed to fetch data action targets for connection', {
        exit: 1,
      });
    }

    let warningMessage: string | undefined;
    if (dataActionTargets.length > 0) {
      const targetNames = dataActionTargets.map(t => t.label).join('\n  ');
      warningMessage = heredoc`
        This command disconnects the org ${connectionName} from add-on ${this._addonName} on app ${app} and deletes the following data action targets:
          ${targetNames}`;
    }

    await confirmCommand({
      comparison: connectionName,
      confirmation: confirm,
      warningMessage,
    });

    try {
      await this.applinkClient.delete<AppLink.DataCloudConnection>(
        `/addons/${this.addonId}/connections/${connectionName}`,
        {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        },
      );
    } catch (error) {
      const connErr = error as AppLink.ConnectionError;
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(
          heredoc`
            Data Cloud connection ${color.yellow(connectionName)} doesn't exist on app ${color.app(app)}.
            Use ${color.command(`heroku applink:connections --app ${app}`)} to list the connections on the app.`,
          {exit: 1},
        );
      } else {
        throw error;
      }
    }

    ux.action.start(`Disconnecting Data Cloud connection ${color.yellow(connectionName)} from ${color.app(app)}`);
    ux.action.stop(humanize('Disconnected'));
  }
}
