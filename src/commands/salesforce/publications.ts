import {color} from '@heroku-cli/color'
import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../lib/applink/types'
import {ux} from '@oclif/core'

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
    const connections: AppLink.SalesforceConnection[] = []
    const publications: AppLink.Publication[] = []

    await this.configureAppLinkClient(app, addon)

    if (connection_name) {
      const {body: connectionResponse} = await this.applinkClient.get<AppLink.SalesforceConnection>(`/addons/${this.addonId}/connections/${connection_name}`, {
        headers: {authorization: `Bearer ${this._applinkToken}`},
      })
      connections.push(connectionResponse)
    } else {
      const {body: connectionResponse} = await this.applinkClient.get<AppLink.SalesforceConnection[]>(`/addons/${this.addonId}/connections`, {
        headers: {authorization: `Bearer ${this._applinkToken}`},
      })
      connections.push(...connectionResponse)
    }

    if (connections.length === 0) {
      ux.error(`There are no Heroku AppLink connections for ${color.app(app)}.`, {exit: 1})
    }

    const activeSFConnections = connections.filter(connection => connection.org.type === 'SalesforceOrg' && connection.status === 'connected')
    if (activeSFConnections.length === 0) {
      ux.error(`There are no active Heroku AppLink connections for ${color.app(app)}.`, {exit: 1})
    }

    for (const connection of activeSFConnections) {
      const {body: pubs} = await this.applinkClient.get<AppLink.Publication[]>(
        `/addons/${this.addonId}/connections/salesforce/${connection.org.connection_name}/apps/${this._appId}`, {
          headers: {authorization: `Bearer ${this._applinkToken}`},
        })
      publications.push(...pubs)
    }

    if (publications.length === 0) {
      ux.log(`You haven't published ${color.app(app)} to a Salesforce org yet.`)
    } else {
      ux.styledHeader(`Heroku AppLink authorizations for app ${color.app(app)}`)

      ux.table(publications, {
        connectionName: {
          header: 'Connection Name',
          get: row => row.connection_name,
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
