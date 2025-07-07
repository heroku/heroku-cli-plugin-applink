import {color} from '@heroku-cli/color'
import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../lib/applink/types'
import {ux, Args} from '@oclif/core'
import open from 'open'
import {CLIError} from '@oclif/core/lib/errors'
import {humanize} from '../../lib/helpers'

export default class Connect extends Command {
  static description = 'connect a Data Cloud org to a Heroku app'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    browser: flags.string({description: 'browser to open OAuth flow with (example: "firefox", "safari")'}),
    'login-url': flags.string({char: 'l', description: 'Salesforce login URL'}),
    remote: flags.remote(),
  }

  static args = {
    connection_name: Args.string({required: true, description: 'name for the Data Cloud connection. Must begin with a letter, end with a letter or a number, and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores (\'_\') are allowed.'}),
  }

  public static urlOpener: (..._args: Parameters<typeof open>) => ReturnType<typeof open> = open

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Connect)
    const {app, addon, browser, 'login-url': loginUrl} = flags
    const {connection_name: connectionName} = args

    await this.configureAppLinkClient(app, addon)
    let connection: AppLink.DataCloudConnection
    ({body: connection} = await this.applinkClient.post<AppLink.DataCloudConnection>(
      `/addons/${this.addonId}/connections/datacloud`,
      {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        body: {
          login_url: loginUrl,
          connection_name: connectionName,
        },
        retryAuth: false,
      }
    ))

    const {id, redirect_uri: redirectUri} = connection

    process.stderr.write(`Opening browser to ${redirectUri}\n`)
    let urlDisplayed = false
    const showBrowserError = () => {
      if (!urlDisplayed) ux.warn('We can\'t open the browser. Try again, or use a different browser.')
      urlDisplayed = true
    }

    try {
      await ux.anykey(
        `Press any key to open up the browser to connect ${color.app(app)} to ${color.yellow(connectionName)}, or ${color.yellow('q')} to exit`
      )
    } catch (error) {
      const {message, oclif} = error as CLIError
      ux.error(message, {exit: oclif?.exit || 1})
    }

    const cp = await Connect.urlOpener(redirectUri as string, {wait: false, ...(browser ? {app: {name: browser}} : {})})
    cp.on('error', (err: Error) => {
      ux.warn(err)
      showBrowserError()
    })
    cp.on('close', (code: number) => {
      if (code !== 0) showBrowserError()
    })

    ux.action.start(`Connecting Data Cloud org to ${color.app(app)} as ${color.yellow(connectionName)}`)
    let {status} = connection
    ux.action.status = humanize(status)

    while (this.isPendingStatus(status)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: connection} = await this.applinkClient.get<AppLink.DataCloudConnection>(
        `/addons/${this.addonId}/connections/${id}`, {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        }
      ));

      ({status} = connection)
      ux.action.status = humanize(status)
    }

    ux.action.stop(humanize(status))
  }

  protected isPendingStatus(status: string): boolean {
    return status !== 'connected' && status !== 'failed' && status !== 'disconnected'
  }
}
