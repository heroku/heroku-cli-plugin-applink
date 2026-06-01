import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {styledHeader, table} from '@heroku/heroku-cli-util/hux';
import {ux} from '@oclif/core/ux';

import * as AppLink from '../../../lib/applink/types.js';
import AppLinkCommand from '../../../lib/base.js';
import {humanize} from '../../../lib/helpers.js';

export default class Index extends AppLinkCommand {
  static description = 'list Heroku AppLink authorized users';
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

    await this.configureAppLinkClient(app, addon);
    const {body: appAuthorizations} = await this.applinkClient.get<
      AppLink.Authorization[]
    >(`/addons/${this.addonId}/authorizations`, {
      headers: {authorization: `Bearer ${this._applinkToken}`},
      retryAuth: false,
    });

    if (appAuthorizations.length === 0) {
      ux.stdout(`There are no Heroku AppLink authorizations for add-on ${this._addonName} on app ${color.app(app)}.`);
    } else {
      styledHeader(`Heroku AppLink authorizations for app ${color.app(app)}`);

      table(appAuthorizations, {
        addon: {
          get: () => this._addonName,
          header: 'Add-On',
        },
        developerName: {
          get: row => row.org.developer_name,
          header: 'Developer Name',
        },
        status: {
          get: row =>
            row.status === 'failed'
              ? color.failure(humanize(row.status))
              : humanize(row.status),
        },
        type: {get: row => humanize(AppLink.adjustOrgType(row.org.type))},
      });

      if (appAuthorizations.some(row => row.status === 'failed')) {
        ux.stdout('\nYou have one or more failed authorizations. For more information on how to fix authorizations, see https://devcenter.heroku.com/articles/working-with-heroku-applink#authorization-statuses.');
      }
    }
  }
}
