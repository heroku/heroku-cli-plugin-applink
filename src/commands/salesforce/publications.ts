import {color} from '@heroku-cli/color'
import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../lib/applink/types'
import {ux} from '@oclif/core'
import {humanize} from '../../lib/helpers'

export default class Publications extends Command {
  static description = 'list Salesforce orgs the app is published to'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    connection_name: flags.string({description: 'name of the Salesforce connection'}),
    remote: flags.remote(),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Publications)
    const {addon, app, connection_name} = flags

    await this.configureAppLinkClient(app, addon)

    const {body: connections} = await this.applinkClient.get<AppLink.Connection[]>(`/addons/${this.addonId}/connections`)
    const validConnections = connections.filter(connection => connection.type === 'SalesforceOrg' && connection.status === 'connected' && connection.app_id === app === this._appID)
    const {body: publications} = await this.applinkClient.get<AppLink.Publication[]>(`/addons/${this.addonId}/connections/salesforce/${connection_name}/apps`)

    if (publications.length === 0) {
      ux.log(`You haven't published ${color.app(app)} to ${color.yellow(connection_name)} yet.`)
    } else {
      ux.styledHeader(`Heroku AppLink authorizations for app ${color.app(app)}`)

      ux.table(publications, {
        connectionName: {
          header: 'Connection Name',
          get: () => connection_name,
        },
        orgId: {
          header: 'Org ID',
          get: row => row.org_id,
        },
        createdDate: {
          header: 'Created Date',
          get: row => row.created_at,
        },
        createdBy: {
          header: 'Created By',
          get: row => row.created_by,
        },
        lastModified: {
          header: 'Last Modified',
          get: row => row.last_modified_at,
        },
        lastModifiedBy: {
          header: 'Last Modified By',
          get: row => row.last_modified_by,
        },
      })
    }
  }
}
