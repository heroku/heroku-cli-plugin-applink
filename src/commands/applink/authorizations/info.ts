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
    developer_name: Args.string({
      description: 'developer name of the authorization',
      required: true,
    }),
  };
  static description = 'show info for a Heroku AppLink authorized user';
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
    const {developer_name: developerName} = args;

    await this.configureAppLinkClient(app, addon);
    let authorization: AppLink.Authorization;
    try {
      ({body: authorization}
        = await this.applinkClient.get<AppLink.Authorization>(
          `/addons/${this.addonId}/authorizations/${developerName}`,
          {
            headers: {authorization: `Bearer ${this._applinkToken}`},
            retryAuth: false,
          },
        ));
    } catch (error) {
      const connErr = error as AppLink.ConnectionError;
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(
          `Developer Name ${color.yellow(developerName)} doesn't exist on app ${color.app(app)}. Use ${color.command('heroku applink:authorizations')} to list all authorized users on the app.`,
          {exit: 1},
        );
      } else {
        throw error;
      }
    }

    styledHeader(`${color.yellow(developerName)} on app ${color.app(app)}`);

    styledObject({
      'Add-on': this._addonName,
      App: app,
      'Created By': authorization!.created_by,
      'Created Date': authorization!.created_at,
      ID: authorization!.id,
      'Instance URL': authorization!.org.instance_url,
      'Last Modified': authorization!.last_modified_at,
      'Last Modified By': authorization!.last_modified_by,
      'Org ID': authorization!.org.id,
      Status: humanize(authorization!.status),
      Type: humanize(AppLink.adjustOrgType(authorization!.org.type)),
      Username: authorization!.org.username,
    });
  }
}
