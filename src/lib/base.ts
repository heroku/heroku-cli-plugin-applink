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

  get apiUrlConfigVarName(): string {
    return `${this.addonServiceSlug.replace(/-/g, '_').toUpperCase()}_API_URL`
  }

  get integration(): APIClient {
    if (this._integration)
      return this._integration

    ux.error(
      heredoc`
        Heroku Integration API Client not configured.
        Did you call ${color.yellow('await this.configureIntegrationClient(app, this.config)')} before accessing ${color.yellow('this.integration')}?
      `,
      {exit: 1}
    )
  }

  get addonId(): string {
    return this._addonId || ''
  }

  protected async configureIntegrationClient(app: string): Promise<void> {
    if (this._integration)
      return

    const addonsRequest = this.heroku.get<Required<Heroku.AddOn>[]>(`/apps/${app}/addons`)
    const configVarsRequest = this.heroku.get<Heroku.ConfigVars>(`/apps/${app}/config-vars`)
    const [{body: addons}, {body: configVars}] = await Promise.all([addonsRequest, configVarsRequest])
    const addon = addons.find(addon => addon.addon_service.name === this.addonServiceSlug)

    if (!addon) {
      ux.error(
        heredoc`
          Heroku Integration add-on isn’t present on ${color.app(app)}.
          Install the add-on using ${color.cmd(`heroku addons:create ${this.addonServiceSlug} -a ${app}`)}.
        `,
        {exit: 1}
      )
    }

    const apiUrl = configVars[this.apiUrlConfigVarName]

    if (!apiUrl) {
      ux.error(
        heredoc`
          Heroku Integration add-on isn’t fully provisioned on ${color.app(app)}.
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
      accept: 'application/json',
      'user-agent': `heroku-cli-plugin-integration/${this.config.version} ${this.config.platform}`,
    }
    const matchedAddonId = baseUrl.pathname.match(/addons\/([^/]+)/)
    this._addonId = matchedAddonId ? matchedAddonId[1] : ''
    this._integration = client
  }
}
