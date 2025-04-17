import {color} from '@heroku-cli/color'
import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../lib/applink/types'
import {ux, Args} from '@oclif/core'
import {humanize} from '../../lib/helpers'
import heredoc from 'tsheredoc'
import {ConnectionError} from '../../lib/applink/types'

export default class Disconnect extends Command {
  static description = 'disconnect a Salesforce org from a Heroku app'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  static args = {
    org_name: Args.string({description: 'name of the Salesforce org instance', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Disconnect)
    const {app, addon} = flags
    const {org_name: orgName} = args

    await this.configureAppLinkClient(app, addon)
    let connection: AppLink.SalesforceConnection
    try {
      ({body: connection} = await this.applinkClient.delete<AppLink.SalesforceConnection>(
        `/addons/${this.addonId}/connections/${orgName}`
      ))
    } catch (error) {
      const connErr = error as ConnectionError
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(
          heredoc`
            Salesforce org ${color.yellow(orgName)} doesn't exist on app ${color.app(app)}.
            Use ${color.cmd(`heroku applink:connections --app ${app}`)} to list the connections on the app`, {exit: 1})
      } else {
        throw error
      }
    }

    ux.action.start(`Disconnecting Salesforce org ${color.yellow(orgName)} from ${color.app(app)}`)
    const {state, error} = connection

    if (state !== 'disconnecting') {
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

    ux.action.stop(humanize('Disconnected'))
  }
}
