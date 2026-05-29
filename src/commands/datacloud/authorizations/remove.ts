import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {confirmCommand} from '@heroku/heroku-cli-util/hux';
import {Args} from '@oclif/core';
import {ux} from '@oclif/core/ux';

import * as AppLink from '../../../lib/applink/types.js';
import AppLinkCommand from '../../../lib/base.js';

export default class Remove extends AppLinkCommand {
  static args = {
    developer_name: Args.string({
      description: 'developer name of the Data Cloud authorization',
      required: true,
    }),
  };
  static description = 'remove a Data Cloud authorization from a Heroku app';
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({required: true}),
    confirm: flags.string({
      char: 'c',
      description: 'set to developer name to bypass confirm prompt',
    }),
    remote: flags.remote(),
  };

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Remove);
    const {addon, app, confirm} = flags;
    const {developer_name: developerName} = args;

    await this.configureAppLinkClient(app, addon);

    await confirmCommand({
      comparison: developerName,
      confirmation: confirm,
      warningMessage: `This command removes the ${color.red(developerName)} credentials from app ${color.app(app)}.`,
    });

    ux.action.start(`Removing credentials ${color.yellow(developerName)} from ${color.app(app)}`);
    await this.applinkClient.delete<AppLink.Authorization>(
      `/addons/${this.addonId}/authorizations/${developerName}`,
      {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        retryAuth: false,
      },
    );
    ux.action.stop();
  }
}
