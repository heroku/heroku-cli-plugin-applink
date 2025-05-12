import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import {ux, Args} from '@oclif/core'
import {humanize} from '../../../lib/helpers'
import heredoc from 'tsheredoc'

export default class Create extends Command {
  static description = 'creates a Data Cloud Data Action Target for a Heroku app'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    'api-name': flags.string({char: 'n', description: '[default: <LABEL>] API name for the data action target'}),
    'org-name': flags.string({char: 'o', required: true, description: 'connected Data Cloud org instance name to create the data action target'}),
    'target-api-path': flags.string({char: 'p', required: true, description: 'API path for the data action target excluding app URL, eg "/" or "/handleDataCloudDataChangeEvent"'}),
    type: flags.string({
      char: 't',
      description: 'Data action target type',
      options: ['WebHook'], default: 'WebHook',
    }),
    remote: flags.remote(),
  }

  static args = {
    label: Args.string({required: true, description: 'Data Action Target label'}),
  }

  protected isPendingStatus(status: string): boolean {
    return status !== 'created' && status !== 'creation_failed'
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Create)
    const {app, addon, 'org-name': orgName, 'target-api-path': targetPath, type} = flags
    let {'api-name': apiName} = flags
    const {label} = args

    if (!apiName) {
      // More encoding needed
      apiName = label.replaceAll(' ', '_')
    }

    await this.configureAppLinkClient(app, addon)

    ux.action.start(`Creating ${color.app(app)} as '${color.yellow(label)}' data action target ${type} to ${color.yellow(orgName)}`)
    let createStatus: AppLink.DataActionTargetCreate
    const {body: createResp} = await this.applinkClient.post<AppLink.DataActionTargetCreate>(
      `/addons/${this.addonId}/connections/datacloud/${orgName}/data_action_targets`,
      {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        body: {
          api_name: apiName,
          label,
          target_endpoint: targetPath,
          type,
        },
      }
    )

    let {status, error} = createResp

    while (this.isPendingStatus(status)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: createStatus} = await this.applinkClient.get<AppLink.DataActionTargetCreate>(
        `/addons/${this.addonId}/connections/datacloud/${orgName}/data_action_targets/${apiName}`,
        {
          headers: {authorization: `Bearer ${this._applinkToken}`},
        }
      ))

      status = createStatus.status
      error = createStatus.error
      ux.action.status = humanize(status)
    }

    ux.action.stop(humanize(status))

    if (status !== 'created') {
      ux.error(
        error === undefined
          ? humanize(status)
          : heredoc`
            ${error.id}
            ${error.message}
          `,
        {exit: 1}
      )
    }
  }
}
