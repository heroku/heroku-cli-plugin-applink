import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import {ux, Args} from '@oclif/core'

export default class Remove extends Command {
  static description = 'remove a Salesforce authorization from a Heroku app'

  static flags = {
    app: flags.app({required: true}),
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    remote: flags.remote(),
  }

  static args = {
    developer_name: Args.string({description: 'developer name of the Salesforce authorization', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Remove)
    const {addon, app} = flags
    const {developer_name: developerName} = args

    await this.configureAppLinkClient(app, addon)

    ux.action.start(`Removing credentials ${color.yellow(developerName)} from ${color.app(app)}`)
    await this.applinkClient.post<AppLink.Authorization>(
      `/addons/${this.addonId}/authorizations/${developerName}`,
      {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        retryAuth: false,
      }
    )
    ux.action.stop()
  }
}
