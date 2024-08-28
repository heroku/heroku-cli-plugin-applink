import {color} from '@heroku-cli/color'
import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Integration from '../../lib/integration/types'
import {ux, Args} from '@oclif/core'
import open from 'open'
import {CLIError} from '@oclif/core/lib/errors'
import {humanize} from '../../lib/helpers'
import heredoc from 'tsheredoc'

export default class Connect extends Command {
  static description = 'connects a Heroku app to a Salesforce Org'

  static flags = {
    app: flags.app({required: true}),
    browser: flags.string({description: 'browser to open OAuth flow with (example: "firefox", "safari")'}),
    'login-url': flags.string({char: 'l', description: 'login URL'}),
    remote: flags.remote(),
    'store-as-run-as-user': flags.boolean({char: 'S', description: 'store user credentials'}),
  }

  static args = {
    org_name: Args.string({description: 'Salesforce Org instance name', required: true}),
  }

  public static urlOpener: (...args: Parameters<typeof open>) => ReturnType<typeof open> = open

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Connect)
    const {app, browser, 'login-url': loginUrl, 'store-as-run-as-user': storeAsRunAsUser} = flags
    const {org_name: orgName} = args

    await this.configureIntegrationClient(app)
    let connection: Integration.SalesforceConnection
    ({body: connection} = await this.integration.post<Integration.SalesforceConnection>(
      `/addons/${this.addonId}/connections/salesforce`,
      {
        body: {
          login_url: loginUrl,
          org_name: orgName,
          store_as_run_as_user: Boolean(storeAsRunAsUser),
        },
      }
    ))

    const {redirect_uri: redirectUri, salesforce_org: salesforceOrg} = connection

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

    ux.action.start(`Connecting ${color.app(app)} to ${color.yellow(orgName)}`)
    let {state, error} = connection
    ux.action.status = humanize(state)

    while (this.isPendingState(state)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: connection} = await this.integration.get<Integration.SalesforceConnection>(
        `/addons/${this.addonId}/connections/${salesforceOrg.org_name}`,
      ));

      ({state, error} = connection)
      ux.action.status = humanize(state)
    }

    ux.action.stop(humanize(state))

    if (state !== 'connected') {
      ux.error(
        error === undefined ?
          humanize(state) :
          heredoc`
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
