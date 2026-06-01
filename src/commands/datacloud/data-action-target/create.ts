import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {Args} from '@oclif/core';
import {ux} from '@oclif/core/ux';

import * as AppLink from '../../../lib/applink/types.js';
import AppLinkCommand from '../../../lib/base.js';
import {humanize} from '../../../lib/helpers.js';

export default class Create extends AppLinkCommand {
  static args = {
    label: Args.string({
      description:
        'label for the data action target. Must begin with a letter, end with a letter or a number,'
        + " and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.",
      required: true,
    }),
  };
  static description
    = 'create a Data Cloud data action target for a Heroku app';
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    'api-name': flags.string({
      char: 'n',
      description: '[default: <LABEL>] API name for the data action target',
    }),
    app: flags.app({required: true}),
    'connection-name': flags.string({
      char: 'o',
      description:
        'Data Cloud connection name to create the data action target',
      required: true,
    }),
    remote: flags.remote(),
    'target-api-path': flags.string({
      char: 'p',
      description:
        'API path for the data action target excluding app URL, eg "/" or "/handleDataCloudDataChangeEvent"',
      required: true,
    }),
    type: flags.string({
      char: 't',
      default: 'webhook',
      description: 'Data action target type',
      options: ['webhook'],
    }),
  };

  protected isPendingStatus(status: string): boolean {
    return status !== 'created' && status !== 'creation_failed';
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Create);
    const {
      addon,
      app,
      'connection-name': connectionName,
      'target-api-path': targetPath,
      type,
    } = flags;
    let {'api-name': apiName} = flags;
    const {label} = args;

    if (!apiName) {
      apiName = label.replaceAll(' ', '_');
    }

    await this.configureAppLinkClient(app, addon);

    ux.action.start(`Creating ${color.app(app)} as '${color.yellow(label)}' data action target ${type} to ${color.yellow(connectionName)}`);

    const {body: createResp}
      = await this.applinkClient.post<AppLink.DataActionTargetCreate>(
        `/addons/${this.addonId}/connections/datacloud/${connectionName}/data_action_targets`,
        {
          body: {
            api_name: apiName,
            label,
            target_endpoint: targetPath,
            type,
          },
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        },
      );

    let {status} = createResp;
    let createStatus: AppLink.DataActionTargetCreate;

    /* eslint-disable no-await-in-loop */
    while (this.isPendingStatus(status)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000);
      });

      ({body: createStatus}
        = await this.applinkClient.get<AppLink.DataActionTargetCreate>(
          `/addons/${this.addonId}/connections/datacloud/${connectionName}/data_action_targets/${apiName}`,
          {
            headers: {authorization: `Bearer ${this._applinkToken}`},
            retryAuth: false,
          },
        ));

      status = createStatus.status;
      ux.action.status = humanize(status);
    }
    /* eslint-enable no-await-in-loop */

    ux.action.stop(humanize(status));
  }
}
