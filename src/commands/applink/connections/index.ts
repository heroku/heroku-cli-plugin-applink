import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import * as Heroku from '@heroku-cli/schema'
import {ux} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

type AppConnection = Pick<Heroku.AddOn, 'app'> & AppLink.Connection

export default class Index extends Command {
  static description = 'list Heroku AppLink connections'

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
      retryAuth: false,
    }))

    if (appConnections.length === 0) {
      ux.log(`There are no Heroku AppLink connections for app ${color.app(app)}.`)
    } else {
      ux.styledHeader(`Heroku AppLink connections for add-on ${color.addon(this._addonName)} on app ${color.app(app)}`)

      ux.table(appConnections, {
        addon: {
          header: 'Add-On',
          get: () => this._addonName,
        },
        type: {get: row => humanize(AppLink.adjustOrgType(row.org.type))},
        connectionName: {
          header: 'Connection Name',
          get: row => row.org.connection_name,
        },
        status: {get: row => row.status === 'failed' ? color.red(humanize(row.status)) : humanize(row.status)},
      })

      if (appConnections.some(row => row.status === 'failed')) {
        ux.log('\nYou have one or more failed connections. For more information on how to fix connections, see https://devcenter.heroku.com/articles/heroku-applink#connection-statuses.')
      }
    }
  }
}
