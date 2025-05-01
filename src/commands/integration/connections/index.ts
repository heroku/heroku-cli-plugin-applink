import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Integration from '../../../lib/integration/types'
import * as Heroku from '@heroku-cli/schema'
import {ux} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

type AppConnection = Pick<Heroku.AddOn, 'app'> & Integration.Connection

export default class Index extends Command {
  static description = 'lists Heroku Integration connections'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Index)
    const {app, addon} = flags
    let appConnections: AppConnection[] = []

    await this.configureIntegrationClient(app, addon);
    ({body: appConnections} = await this.integration.get<Integration.Connection[]>(`/addons/${this.addonId}/connections`))

    if (appConnections.length === 0) {
      ux.log(`No Heroku Integration connections${app ? ` for app ${color.app(app)}` : ''}.`)
    } else {
      ux.styledHeader(`Heroku Integration connections${app ? ` for app ${color.app(app)}` : ''}`)

      ux.table(appConnections, {
        ...(app ? {} : {app: {get: row => row.app?.name}}),
        type: {get: row => humanize(Integration.adjustOrgType(row.type))},
        orgName: {
          header: 'Org Name',
          get: row => Integration.isSalesforceConnection(row) ? row.salesforce_org.org_name : row.datacloud_org.org_name,
        },
        status: {get: row => humanize(row.state)},
        runAsUser: {
          header: 'Run As User',
          get: row => Integration.isSalesforceConnection(row) ? row.salesforce_org.run_as_user : row.datacloud_org.run_as_user,
        },
      })
    }
  }
}
