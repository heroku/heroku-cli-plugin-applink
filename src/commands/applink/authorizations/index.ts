import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import {ux} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

export default class Index extends Command {
  static description = 'list Heroku AppLink authorized users'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Index)
    const {addon, app} = flags
    let appAuthorizations: AppLink.Authorization[]

    await this.configureAppLinkClient(app, addon)
    try {
      ({body: appAuthorizations} = await this.applinkClient.get<AppLink.Authorization[]>(`/addons/${this.addonId}/authorizations`, {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        retryAuth: false,
      }))
    } catch (error) {
      const applinkError = error as AppLink.StandardApplinkError
      throw applinkError
    }

    if (appAuthorizations.length === 0) {
      ux.log(`There are no Heroku AppLink authorizations for add-on ${this._addonName} on app ${color.app(app)}.`)
    } else {
      ux.styledHeader(`Heroku AppLink authorizations for app ${color.app(app)}`)

      ux.table(appAuthorizations, {
        type: {get: row => humanize(AppLink.adjustOrgType(row.org.type))},
        addon: {
          header: 'Add-On',
          get: () => this._addonName,
        },
        developerName: {
          header: 'Developer Name',
          get: row => row.org.developer_name,
        },
        status: {get: row => humanize(row.status)},
      })
    }
  }
}
