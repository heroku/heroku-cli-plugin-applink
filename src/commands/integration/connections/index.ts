import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Integration from '../../../lib/integration/types'
import * as Heroku from '@heroku-cli/schema'
import {ux} from '@oclif/core'
import {arraySlice, humanize} from '../../../lib/helpers'

type AppConnection = Pick<Heroku.AddOn, 'app'> & Integration.Connection
type AppConnectionListUrl = Pick<Heroku.AddOn, 'app'> & {url: string}

export default class Index extends Command {
  static description = 'lists Heroku Integration connections'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app(),
    remote: flags.remote(),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Index)
    const {app, addon} = flags
    let appConnections: AppConnection[] = []

    if (app) {
      await this.configureIntegrationClient(app, addon);
      ({body: appConnections} = await this.integration.get<Integration.Connection[]>(`/addons/${this.addonId}/connections`))
    } else {
      const integrationAddons = await this.getIntegrationAddons()
      appConnections = integrationAddons.length > 0 ? (await this.getAppConnections(integrationAddons)) : []
    }

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

  protected async getIntegrationAddons() {
    const {body: addons} = await this.heroku.get<Required<Heroku.AddOn>[]>('/addons')
    return addons.filter(addon => addon.addon_service?.name === this.addonServiceSlug)
  }

  protected async getAppConnections(integrationAddons: Required<Heroku.AddOn>[]): Promise<AppConnection[]> {
    const appConnections: Array<AppConnection> = []

    for (const addonsSlice of arraySlice(integrationAddons)) {
      const appConnectionListUrls = await this.getAppConnectionListUrls(addonsSlice)
      const connectionListPromises = appConnectionListUrls.map(appConnectionListUrl => this.heroku.get<Integration.Connection[]>(
        appConnectionListUrl.url,
        {host: new URL(appConnectionListUrl.url).hostname}
      ))
      const connectionListResponses = await Promise.all(connectionListPromises)
      connectionListResponses.forEach((response, index) => {
        const connections = response.body
        connections.forEach(connection => {
          appConnections.push({
            app: addonsSlice[index].app,
            ...connection,
          })
        })
      })
    }

    return appConnections
  }

  protected async getAppConnectionListUrls(integrationAddons: Required<Heroku.AddOn>[]): Promise<AppConnectionListUrl[]> {
    const configVarPromises = integrationAddons.map(addon => this.heroku.get<Heroku.ConfigVars>(`/apps/${addon.app.id}/config-vars`))
    const configVarsResponses = await Promise.all(configVarPromises)
    const appConnectionListUrls: Array<AppConnectionListUrl> = []

    configVarsResponses.forEach((response, index) => {
      const {apiUrl} = this.getConfigVars(integrationAddons[index], response.body)
      if (apiUrl) appConnectionListUrls.push({
        url: `${apiUrl}/connections`,
        app: integrationAddons[index].app,
      })
    })

    return appConnectionListUrls
  }
}
