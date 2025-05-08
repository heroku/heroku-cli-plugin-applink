import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import {Args, ux} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

export default class Info extends Command {
  static description = 'shows info for a Heroku AppLink connection'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  static args = {
    org_name: Args.string({description: 'connected org name', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Info)
    const {app, addon} = flags
    const {org_name: orgName} = args

    await this.configureAppLinkClient(app, addon)
    let connection: AppLink.Connection
    try {
      ({body: connection} = await this.applinkClient.get<AppLink.Connection>(
        `/addons/${this.addonId}/connections/${orgName}`, {
          headers: {authorization: `Bearer ${this._applinkToken}`},
        }
      ))
    } catch (error) {
      const connErr = error as AppLink.ConnectionError
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(`Data Cloud org ${color.yellow(orgName)} not found or not connected to app ${color.app(app)}`, {exit: 1})
      } else {
        throw error
      }
    }

    const orgInfo = AppLink.isSalesforceConnection(connection) ? connection.salesforce_org : connection.datacloud_org

    ux.styledObject({
      Id: connection.id,
      'Instance URL': orgInfo.instance_url,
      'Org ID': orgInfo.id,
      'Org Name': orgInfo.org_name,
      'Run As User': orgInfo.run_as_user,
      Status: humanize(connection.status),
      Type: humanize(AppLink.adjustOrgType(connection.type)),
    })
  }
}
