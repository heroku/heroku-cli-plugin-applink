import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import * as Heroku from '@heroku-cli/schema'
import {ux} from '@oclif/core'
import {arraySlice, humanize} from '../../../lib/helpers'

type AppConnection = Pick<Heroku.AddOn, 'app'> & AppLink.Connection
type AppConnectionListUrl = Pick<Heroku.AddOn, 'app'> & {url: string}

export default class Index extends Command {
  static description = 'lists Heroku AppLink connections'

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
      await this.configureAppLinkClient(app, addon);
      ({body: appConnections} = await this.applinkClient.get<AppLink.Connection[]>(`/addons/${this.addonId}/connections`))
    } else {
      const applinkAddons = await this.getAppLinkAddons()
      appConnections = applinkAddons.length > 0 ? (await this.getAppConnections(applinkAddons)) : []
    }

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
        status: {get: row => humanize(row.state)},
        runAsUser: {
          header: 'Run As User',
          get: row => AppLink.isSalesforceConnection(row) ? row.salesforce_org.run_as_user : row.datacloud_org.run_as_user,
        },
      })
    }
  }

  protected async getAppLinkAddons() {
    const {body: addons} = await this.heroku.get<Required<Heroku.AddOn>[]>('/addons')
    return addons.filter(addon => addon.addon_service?.name === this.addonServiceSlug || addon.addon_service?.name === this.legacyAddonServiceSlug)
  }

  protected async getAppConnections(applinkAddons: Required<Heroku.AddOn>[]): Promise<AppConnection[]> {
    const appConnections: Array<AppConnection> = []

    for (const addonsSlice of arraySlice(applinkAddons)) {
      const appConnectionListUrls = await this.getAppConnectionListUrls(addonsSlice)
      const connectionListPromises = appConnectionListUrls.map(appConnectionListUrl => this.heroku.get<AppLink.Connection[]>(
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

  protected async getAppConnectionListUrls(applinkAddons: Required<Heroku.AddOn>[]): Promise<AppConnectionListUrl[]> {
    const configVarPromises = applinkAddons.map(addon => this.heroku.get<Heroku.ConfigVars>(`/apps/${addon.app.id}/config-vars`))
    const configVarsResponses = await Promise.all(configVarPromises)
    const appConnectionListUrls: Array<AppConnectionListUrl> = []

    configVarsResponses.forEach((response, index) => {
      const {apiUrl} = this.getConfigVars(applinkAddons[index], response.body)
      if (apiUrl) appConnectionListUrls.push({
        url: `${apiUrl}/connections`,
        app: applinkAddons[index].app,
      })
    })

    return appConnectionListUrls
  }
}
