import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Integration from '../../../lib/integration/types'
import {Args, ux} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

export default class Info extends Command {
  static description = 'shows info for a Heroku AppLink authorized user'

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
    const {app} = flags
    const {developer_name: developerName} = args

    await this.configureIntegrationClient(app)
    let authorization: Integration.Authorization
    try {
      ({body: authorization} = await this.integration.get<Integration.Authorization>(
        `/addons/${this.addonId}/authorizations/${developerName}`
      ))
    } catch (error) {
      const connErr = error as Integration.ConnectionError
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(`Developer Name ${color.yellow(developerName)} doesn't exist on app ${color.app(app)}. Use ${color.cmd('heroku applink:authorizations')} to list all authorized users on the app.`, {exit: 1})
      } else {
        throw error
      }
    }

    const orgInfo = Integration.isSalesforceConnection(authorization) ? authorization.salesforce_org : authorization.datacloud_org

    ux.styledObject({
      Id: connection.id,
      'Instance URL': orgInfo.instance_url,
      'Org ID': orgInfo.id,
      'Org Name': orgInfo.org_name,
      'Run As User': orgInfo.run_as_user,
      Status: humanize(connection.state),
      App: app,
      Type: humanize(Integration.adjustConnectionType(connection.type)),
      'Add-On': this._addonName,
      'Created Date': connection.created_at,
      'Created By': connection.created_by,
      'Last Modified': connection.updated_at,
      'Last Modified By': connection.updated_by,
    })
  }
}
