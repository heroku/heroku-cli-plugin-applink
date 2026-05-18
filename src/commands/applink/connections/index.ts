import {flags} from '@heroku-cli/command';
import * as Heroku from '@heroku-cli/schema';
import * as color from '@heroku/heroku-cli-util/color';
import {styledHeader, table} from '@heroku/heroku-cli-util/hux';
import {ux} from '@oclif/core/ux';

import * as AppLink from '../../../lib/applink/types.js';
import AppLinkCommand from '../../../lib/base.js';
import {humanize} from '../../../lib/helpers.js';

type AppConnection = AppLink.Connection & Pick<Heroku.AddOn, 'app'>;

export default class Index extends AppLinkCommand {
  static description = 'list Heroku AppLink connections';
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({required: true}),
    remote: flags.remote(),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(Index);
    const {addon, app} = flags;
    let appConnections: AppConnection[] = [];

    await this.configureAppLinkClient(app, addon);
    ({body: appConnections} = await this.applinkClient.get<
      AppLink.Connection[]
    >(`/addons/${this.addonId}/connections`, {
      headers: {authorization: `Bearer ${this._applinkToken}`},
      retryAuth: false,
    }));

    if (appConnections.length === 0) {
      ux.stdout(`There are no Heroku AppLink connections for app ${color.app(app)}.`);
    } else {
      styledHeader(`Heroku AppLink connections for add-on ${color.addon(this._addonName)} on app ${color.app(app)}`);

      table(appConnections, {
        addon: {
          get: () => this._addonName,
          header: 'Add-On',
        },
        connectionName: {
          get: row => row.org.connection_name,
          header: 'Connection Name',
        },
        status: {
          get: row =>
            row.status === 'failed'
              ? color.failure(humanize(row.status))
              : humanize(row.status),
        },
        type: {get: row => humanize(AppLink.adjustOrgType(row.org.type))},
      });

      if (appConnections.some(row => row.status === 'failed')) {
        ux.stdout('\nYou have one or more failed connections. For more information on how to fix connections, see https://devcenter.heroku.com/articles/working-with-heroku-applink#connection-statuses.');
      }
    }
  }
}
