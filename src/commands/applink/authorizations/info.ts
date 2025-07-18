import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import {Args, ux} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

export default class Info extends Command {
  static description = 'show info for a Heroku AppLink authorized user'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  static args = {
    developer_name: Args.string({description: 'developer name of the authorization', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Info)
    const {app, addon} = flags
    const {developer_name: developerName} = args

    await this.configureAppLinkClient(app, addon)
    let authorization: AppLink.Authorization
    try {
      ({body: authorization} = await this.applinkClient.get<AppLink.Authorization>(
        `/addons/${this.addonId}/authorizations/${developerName}`, {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        }
      ))
    } catch (error) {
      const connErr = error as AppLink.ConnectionError
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(`Developer Name ${color.yellow(developerName)} doesn't exist on app ${color.app(app)}. Use ${color.cmd('heroku applink:authorizations')} to list all authorized users on the app.`, {exit: 1})
      } else {
        throw error
      }
    }

    ux.styledHeader(`${color.yellow(developerName)} on app ${color.app(app)}`)

    ux.styledObject({
      ID: authorization.id,
      'Instance URL': authorization.org.instance_url,
      'Org ID': authorization.org.id,
      Username: authorization.org.username,
      Status: humanize(authorization.status),
      App: app,
      Type: humanize(AppLink.adjustOrgType(authorization.org.type)),
      'Add-on': this._addonName,
      'Created Date': authorization.created_at,
      'Created By': authorization.created_by,
      'Last Modified': authorization.last_modified_at,
      'Last Modified By': authorization.last_modified_by,
    })
  }
}
