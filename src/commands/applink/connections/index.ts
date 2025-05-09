import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import * as Heroku from '@heroku-cli/schema'
import {ux} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

type AppConnection = Pick<Heroku.AddOn, 'app'> & AppLink.Connection

export default class Index extends Command {
  static description = 'lists Heroku AppLink connections'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Index)
    const {app, addon} = flags
    let appConnections: AppConnection[] = []

    await this.configureAppLinkClient(app, addon);
    ({body: appConnections} = await this.applinkClient.get<AppLink.Connection[]>(`/addons/${this.addonId}/connections`, {
      headers: {authorization: `Bearer ${this._applinkToken}`},
    }))

    if (appConnections.length === 0) {
      ux.log(`No Heroku AppLink connections${app ? ` for app ${color.app(app)}` : ''}.`)
    } else {
      ux.styledHeader(`Heroku AppLink connections${app ? ` for app ${color.app(app)}` : ''}`)

      ux.table(appConnections, {
        ...(app ? {} : {app: {get: row => row.app?.name}}),
        type: {get: row => humanize(AppLink.adjustOrgType(row.type))},
        orgName: {
          header: 'Org Name',
          get: row => AppLink.isSalesforceConnection(row) ? row.salesforce_org.org_name : row.datacloud_org.org_name,
        },
        status: {get: row => humanize(row.status)},
        runAsUser: {
          header: 'Run As User',
          get: row => AppLink.isSalesforceConnection(row) ? row.salesforce_org.run_as_user : row.datacloud_org.run_as_user,
        },
      })
    }
  }
}
