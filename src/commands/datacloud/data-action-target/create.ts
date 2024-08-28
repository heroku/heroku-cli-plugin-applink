import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Integration from '../../../lib/integration/types'
import {ux, Args} from '@oclif/core'

export default class Create extends Command {
  static description = 'create Data Action Target webhook for a Heroku app'

  static flags = {
    app: flags.app({required: true}),
    'org-name': flags.string({char: 'o', description: 'authorized Data Cloud Org instance name where Data Action Target is created', required: true}),
    type: flags.string({char: 't', description: 'Data Action Target type', options: ['WebHook'], default: 'WebHook'}),
    'api-name': flags.string({char: 'n', description: 'API name for Data Action Target, default derived from name'}),
  }

  static args = {
    label: Args.string({description: 'Data Action Target label', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Create)
    const {app, 'org-name': orgName, type, 'api-name': apiName} = flags
    const {label} = args

    await this.configureIntegrationClient(app)
    await this.integration.post<Integration.Connection>(
      `/datacloud/${orgName}/data_action_targets`,
      {
        body: {
          api_name: apiName,
          label,
          type,
        },
      }
    )

    ux.action.stop()
  }
}
