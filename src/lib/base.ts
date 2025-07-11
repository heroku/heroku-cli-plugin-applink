import {color} from '@heroku-cli/color'
import {APIClient, Command} from '@heroku-cli/command'
import * as Heroku from '@heroku-cli/schema'
import * as HerokuSDK from '../lib/types'
import {ux} from '@oclif/core'
import heredoc from 'tsheredoc'

export default abstract class extends Command {
  private _addonId!: string
  _applink!: APIClient
  _addonName!: string
  _appId!: string
  _applinkToken!: string

  get addonServiceSlug(): string {
    return process.env.HEROKU_APPLINK_ADDON || 'heroku-applink'
  }

  get applinkClient(): APIClient {
    if (this._applink)
      return this._applink

    ux.error(
      heredoc`
        AppLink API Client not configured.
        Did you call ${color.yellow('await this.configureAppLinkClient(app, this.config)')} before accessing ${color.yellow('this.applinkClient')}?
      `,
      {exit: 1}
    )
  }

  get addonId(): string {
    return this._addonId || ''
  }

  protected getConfigVars(addonAttachment: Heroku.AddOnAttachment, configVars: Heroku.ConfigVars): {apiUrl: string, applinkToken: string} {
    const apiConfigVarName = addonAttachment.name + '_API_URL'
    const tokenConfigVarName = addonAttachment.name + '_TOKEN'
    const apiUrl = configVars[apiConfigVarName]
    const applinkToken = configVars[tokenConfigVarName]
    return {apiUrl, applinkToken}
  }

  protected async configureAppLinkClient(app: string, addon?: string): Promise<void> {
    if (this._applink)
      return

    const appInfoRequest = this.heroku.get<Heroku.App>(`/apps/${app}`)
    const addonsRequest = this.heroku.get<Required<Heroku.AddOn>[]>(`/apps/${app}/addons`)
    const addonAttachmentsRequest = this.heroku.get<Required<Heroku.AddOnAttachment>[]>(`/apps/${app}/addon-attachments`)
    const configVarsRequest = this.heroku.get<Heroku.ConfigVars>(`/apps/${app}/config-vars`)
    const [{body: appInfo}, {body: addons}, {body: addonAttachments}, {body: configVars}] = await Promise.all([appInfoRequest, addonsRequest, addonAttachmentsRequest, configVarsRequest])
    const applinkAddons = addons.filter(addon => addon.addon_service.name === this.addonServiceSlug)
    let applinkAddon: Heroku.AddOn | undefined

    if (applinkAddons.length === 0) {
      ux.error(
        heredoc`
          AppLink add-on isn't present on ${color.app(app)}.
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
            Use ${color.cmd(`heroku addons --app ${app}`)} to list the add-ons on the app.
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

    const addonAttachment = addonAttachments.find(attachment => attachment.addon.id === applinkAddon.id)
    const {apiUrl, applinkToken} = this.getConfigVars(addonAttachment!, configVars)

    if (!apiUrl || !applinkToken) {
      ux.error(
        heredoc`
          AppLink add-on isn't fully provisioned on ${color.app(app)}.
          Wait for the add-on to finish provisioning with ${color.cmd(`heroku addons:wait ${applinkAddon.name} -a ${app}`)}.
        `,
        {exit: 1}
      )
    }

    const {body: sso} = await this.heroku.get<HerokuSDK.SSO>(`/apps/${app}/addons/${applinkAddon.id}/sso`, {
      headers: {
        Accept: 'application/vnd.heroku+json; version=3.sdk',
      },
    })
    const encodedSSO = Buffer.from(JSON.stringify(sso)).toString('base64')

    const baseUrl = new URL(apiUrl)
    const client = new APIClient(this.config)
    client.defaults.host = baseUrl.hostname
    client.defaults.headers = {
      ...this.heroku.defaults.headers,
      accept: 'application/json',
      'user-agent': `heroku-cli-plugin-applink/${this.config.version} ${this.config.platform}`,
      'x-app-uuid': appInfo?.id || '',
      'x-addon-sso': encodedSSO,
    }
    this._applinkToken = applinkToken
    this._addonId = applinkAddon.id || ''
    this._addonName = applinkAddon.name || ''
    this._appId = appInfo?.id || ''
    this._applink = client
  }
}
