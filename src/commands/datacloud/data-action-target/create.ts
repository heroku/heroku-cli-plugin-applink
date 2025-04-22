import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Integration from '../../../lib/integration/types'
import {ux, Args} from '@oclif/core'
import {humanize} from '../../../lib/helpers'
import heredoc from 'tsheredoc'

export default class Create extends Command {
  static description = 'creates a Data Cloud Data Action Target for a Heroku app'

  static flags = {
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

  protected isPendingState(state: string): boolean {
    return state !== 'created' && state !== 'creation_failed'
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Create)
    const {app, 'org-name': orgName, 'target-api-path': targetPath, type} = flags
    let {'api-name': apiName} = flags
    const {label} = args

    if (!apiName) {
      // More encoding needed
      apiName = label.replaceAll(' ', '_')
    }

    await this.configureIntegrationClient(app)

    ux.action.start(`Creating ${color.app(app)} as '${color.yellow(label)}' data action target ${type} to ${color.yellow(orgName)}`)
    let createState: Integration.DataActionTargetCreate
    const {body: createResp} = await this.integration.post<Integration.DataActionTargetCreate>(
      `/addons/${this.addonId}/connections/datacloud/${orgName}/data_action_targets`,
      {
        body: {
          api_name: apiName,
          label,
          target_endpoint: targetPath,
          type,
        },
      }
    )

    let {state, error} = createResp

    while (this.isPendingState(state)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: createState} = await this.integration.get<Integration.DataActionTargetCreate>(
        `/addons/${this.addonId}/connections/datacloud/${orgName}/data_action_targets/${apiName}`,
      ))

      // ({state, error} = importState)
      state = createState.state
      error = createState.error
      ux.action.status = humanize(state)
    }

    ux.action.stop(humanize(state))

    if (state !== 'created') {
      ux.error(
        error === undefined
          ? humanize(state)
          : heredoc`
            ${error.id}
            ${error.message}
          `,
        {exit: 1}
      )
    }
  }
}
