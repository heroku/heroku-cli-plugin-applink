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
      retryAuth: false,
    }))

    if (appConnections.length === 0) {
      ux.log(`No Heroku AppLink connections${app ? ` for app ${color.app(app)}` : ''}.`)
    } else {
      ux.styledHeader(`Heroku AppLink connections${app ? ` for app ${color.app(app)}` : ''}`)

      ux.table(appConnections, {
        ...(app ? {} : {app: {get: row => row.app?.name}}),
        type: {get: row => humanize(AppLink.adjustOrgType(row.org.type))},
        orgName: {
          header: 'Connection Name',
          get: row => row.org.connection_name,
        },
        status: {get: row => humanize(row.status)},
      })
    }
  }
}
