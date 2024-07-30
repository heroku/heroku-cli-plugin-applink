import {color} from '@heroku-cli/color'
import Command from '../../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Events from '../../../../lib/events/types'
import {ux, Args} from '@oclif/core'
import open from 'open'
import {CLIError} from '@oclif/core/lib/errors'

export default class Create extends Command {
  static description = 'creates a Salesforce Platform authorization for Heroku Events'

  static flags = {
    app: flags.app({required: true}),
    browser: flags.string({description: 'browser to open OAuth flow with (example: "firefox", "safari")'}),
    remote: flags.remote(),
  }

  static args = {
    org_name: Args.string({description: 'Salesforce Org instance name', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Create)
    const {app, browser} = flags
    const {org_name: orgName} = args

    await this.configureEventsClient(app)
    let authorization: Events.Authorization
    ({body: authorization} = await this.events.post<Events.Authorization>(
      `/v1/tenants/${this.tenant_id}/platforms/salesforce/authorizations`,
      {
        body: {org_name: orgName},
      }
    ))

    const {id: authorizationId, extra} = authorization
    const {redirect_uri: redirectUri} = extra!
    process.stderr.write(`Opening browser to ${redirectUri}\n`)
    let urlDisplayed = false
    const showBrowserError = () => {
      if (!urlDisplayed) ux.warn('Cannot open browser.')
      urlDisplayed = true
    }

    try {
      await ux.anykey(
        `Press any key to open up the browser to authorize ${color.app(app)} or ${color.yellow('q')} to exit`
      )
    } catch (error) {
      const {message, oclif} = error as CLIError

      // Destroy the authorization if the user pressed 'q' or interrupted with ctrl+c
      await this.events.delete<Events.Authorization>(
        `/v1/tenants/${this.tenant_id}/authorizations/${authorizationId}`
      )
      ux.error(message, {exit: oclif?.exit || 1})
    }

    const cp = await Create.urlOpener(redirectUri, {wait: false, ...(browser ? {app: {name: browser}} : {})})
    cp.on('error', (err: Error) => {
      ux.warn(err)
      showBrowserError()
    })
    cp.on('close', (code: number) => {
      if (code !== 0) showBrowserError()
    })

    ux.action.start('Heroku Events: Waiting for authentication')

    let {params: {url}} = authorization
    while (!url || url.length === 0) { // TODO: how to better detect when authentication succeeded?
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: authorization} = await this.events.get<Events.Authorization>(
        `/v1/tenants/${this.tenant_id}/authorizations/${authorizationId}`,
      ));

      ({params: {url}} = authorization)
    }

    ux.action.stop()
  }

  public static urlOpener: (...args: Parameters<typeof open>) => ReturnType<typeof open> = open
}
