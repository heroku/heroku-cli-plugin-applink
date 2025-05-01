import {color} from '@heroku-cli/color'
import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../lib/applink/types'
import {ux, Args} from '@oclif/core'
import open from 'open'
import {CLIError} from '@oclif/core/lib/errors'
import {humanize} from '../../lib/helpers'
import heredoc from 'tsheredoc'

export default class Connect extends Command {
  static description = 'connects a Salesforce Org to Heroku app'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    browser: flags.string({description: 'browser to open OAuth flow with (example: "firefox", "safari")'}),
    'login-url': flags.string({char: 'l', description: 'login URL'}),
    remote: flags.remote(),
  }

  static args = {
    org_name: Args.string({description: 'Salesforce Org instance name.  Must begin with a letter. Then allowed chars are alphanumeric and underscores \'_\' (non-consecutive). Must end with a letter or a number. Must be min 3, max 30 characters.', required: true}),
  }

  public static urlOpener: (..._args: Parameters<typeof open>) => ReturnType<typeof open> = open

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Connect)
    const {app, addon, browser, 'login-url': loginUrl} = flags
    const {org_name: orgName} = args

    await this.configureAppLinkClient(app, addon)
    let connection: AppLink.SalesforceConnection
    ({body: connection} = await this.applinkClient.post<AppLink.SalesforceConnection>(
      `/addons/${this.addonId}/connections/salesforce`,
      {
        body: {
          login_url: loginUrl,
          org_name: orgName,
        },
      }
    ))

    const {id, redirect_uri: redirectUri} = connection

    process.stderr.write(`Opening browser to ${redirectUri}\n`)
    let urlDisplayed = false
    const showBrowserError = () => {
      if (!urlDisplayed) ux.warn('Cannot open browser.')
      urlDisplayed = true
    }

    try {
      await ux.anykey(
        `Press any key to open up the browser to connect ${color.app(app)} to ${color.yellow(orgName)}, or ${color.yellow('q')} to exit`
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

    ux.action.start(`Connecting Salesforce org ${color.yellow(orgName)} to ${color.app(app)}`)
    let {state, error} = connection
    ux.action.status = humanize(state)

    while (this.isPendingState(state)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: connection} = await this.applinkClient.get<AppLink.SalesforceConnection>(
        `/addons/${this.addonId}/connections/${id}`,
      ));

      ({state, error} = connection)
      ux.action.status = humanize(state)
    }

    ux.action.stop(humanize(state))

    if (state !== 'connected') {
      ux.error(
        error === undefined
          ? humanize(state)
          : heredoc`
            ${error.id}
            ${error.message}
          `,
        {exit: 1}
      )
    }
  }

  protected isPendingState(state: string): boolean {
    return state !== 'connected' && state !== 'authentication_failed' && state !== 'connection_failed' && state !== 'disconnected'
  }
}
