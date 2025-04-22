import {color} from '@heroku-cli/color'
import {APIClient, Command} from '@heroku-cli/command'
import * as Heroku from '@heroku-cli/schema'
import {ux} from '@oclif/core'
import heredoc from 'tsheredoc'

export default abstract class extends Command {
  private _integration!: APIClient
  private _addonId!: string

  get addonServiceSlug(): string {
    return process.env.HEROKU_INTEGRATION_ADDON || 'heroku-integration'
  }

  get integration(): APIClient {
    if (this._integration)
      return this._integration

    ux.error(
      heredoc`
        AppLink API Client not configured.
        Did you call ${color.yellow('await this.configureIntegrationClient(app, this.config)')} before accessing ${color.yellow('this.integration')}?
      `,
      {exit: 1}
    )
  }

  get addonId(): string {
    return this._addonId || ''
  }

  protected getConfigVars(addon: Heroku.AddOn, configVars: Heroku.ConfigVars): {apiUrl: string, applinkToken: string} {
    const apiConfigVarName = addon.config_vars?.find(v => v.endsWith('API_URL'))
    const tokenConfigVarName = addon.config_vars?.find(v => v.endsWith('TOKEN'))
    const apiUrl = apiConfigVarName ? configVars[apiConfigVarName] : ''
    const applinkToken = tokenConfigVarName ? configVars[tokenConfigVarName] : ''
    return {apiUrl, applinkToken}
  }

  protected async configureIntegrationClient(app: string, addon?: string): Promise<void> {
    if (this._integration)
      return

    const addonsRequest = this.heroku.get<Required<Heroku.AddOn>[]>(`/apps/${app}/addons`)
    const configVarsRequest = this.heroku.get<Heroku.ConfigVars>(`/apps/${app}/config-vars`)
    const [{body: addons}, {body: configVars}] = await Promise.all([addonsRequest, configVarsRequest])
    const applinkAddons = addons.filter(addon => addon.addon_service.name === this.addonServiceSlug)
    let applinkAddon: Heroku.AddOn | undefined

    if (applinkAddons.length === 0) {
      ux.error(
        heredoc`
          AppLink add-on isn’t present on ${color.app(app)}.
          Install the add-on using ${color.cmd(`heroku addons:create ${this.addonServiceSlug} -a ${app}`)}.
        `,
        {exit: 1}
      )
    } else if (addon) {
      applinkAddon = applinkAddons.find(a => a.name === addon || a.id === addon)
      if (!applinkAddon) {
        ux.error(
          heredoc`
            AppLink add-on ${color.addon(addon)} doesn't exist on ${color.app(app)}.
            Use ${color.cmd(`heroku addons:list --app ${app}`)} to list the add-ons on the app.
          `,
          {exit: 1}
        )
      }
    } else if (applinkAddons.length === 1) {
      applinkAddon = applinkAddons[0]
    } else {
      ux.error(
        heredoc`
          Your app ${color.app(app)} has multiple AppLink add-ons.
          Rerun the command with the ${color.cmd('--addon')} flag to specify which one to use.
        `,
        {exit: 1}
      )
    }

    const {apiUrl, applinkToken} = this.getConfigVars(applinkAddon, configVars)

    if (!apiUrl || !applinkToken) {
      ux.error(
        heredoc`
          AppLink add-on isn’t fully provisioned on ${color.app(app)}.
          Wait for the add-on to finish provisioning with ${color.cmd(`heroku addons:wait ${this.addonServiceSlug} -a ${app}`)}.
        `,
        {exit: 1}
      )
    }

    const baseUrl = new URL(apiUrl)
    const client = new APIClient(this.config)
    client.defaults.host = baseUrl.hostname
    client.defaults.headers = {
      ...this.heroku.defaults.headers,
      authorization: `Bearer ${applinkToken}`,
      accept: 'application/json',
      'user-agent': `heroku-cli-plugin-integration/${this.config.version} ${this.config.platform}`,
    }
    this._addonId = applinkAddon.id || ''
    this._integration = client
  }
}
