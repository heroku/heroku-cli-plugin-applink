import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import {ux, Args} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

export default class Create extends Command {
  static description = 'create a Data Cloud data action target for a Heroku app'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    'api-name': flags.string({char: 'n', description: '[default: <LABEL>] API name for the data action target'}),
    'connection-name': flags.string({char: 'o', required: true, description: 'Data Cloud connection namee to create the data action target'}),
    'target-api-path': flags.string({char: 'p', required: true, description: 'API path for the data action target excluding app URL, eg "/" or "/handleDataCloudDataChangeEvent"'}),
    type: flags.string({
      char: 't',
      description: 'Data action target type',
      options: ['webhook'], default: 'webhook',
    }),
    remote: flags.remote(),
  }

  static args = {
    label: Args.string({required: true, description: 'label for the data action target. Must begin with a letter, end with a letter or a number, and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores (\'_\') are allowed.'}),
  }

  protected isPendingStatus(status: string): boolean {
    return status !== 'created' && status !== 'creation_failed'
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Create)
    const {app, addon, 'connection-name': connectionName, 'target-api-path': targetPath, type} = flags
    let {'api-name': apiName} = flags
    const {label} = args

    if (!apiName) {
      // More encoding needed
      apiName = label.replaceAll(' ', '_')
    }

    await this.configureAppLinkClient(app, addon)

    ux.action.start(`Creating ${color.app(app)} as '${color.yellow(label)}' data action target ${type} to ${color.yellow(connectionName)}`)
    let createStatus: AppLink.DataActionTargetCreate
    const {body: createResp} = await this.applinkClient.post<AppLink.DataActionTargetCreate>(
      `/addons/${this.addonId}/connections/datacloud/${connectionName}/data_action_targets`,
      {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        retryAuth: false,
        body: {
          api_name: apiName,
          label,
          target_endpoint: targetPath,
          type,
        },
      }
    )

    let {status} = createResp

    while (this.isPendingStatus(status)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: createStatus} = await this.applinkClient.get<AppLink.DataActionTargetCreate>(
        `/addons/${this.addonId}/connections/datacloud/${connectionName}/data_action_targets/${apiName}`,
        {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        }
      ))

      status = createStatus.status
      ux.action.status = humanize(status)
    }

    ux.action.stop(humanize(status))
  }
}
