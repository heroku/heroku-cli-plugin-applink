import {color} from '@heroku-cli/color'
import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Integration from '../../lib/integration/types'
import {ux, Args} from '@oclif/core'
import {humanize} from '../../lib/helpers'
import heredoc from 'tsheredoc'
import {ConnectionError} from '../../lib/integration/types'

export default class Disconnect extends Command {
  static description = 'disconnects a Salesforce Org from a Heroku app'

  static flags = {
    app: flags.app({required: true}),
  }

  static args = {
    org_name: Args.string({description: 'Salesforce Org instance name', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Disconnect)
    const {app} = flags
    const {org_name: orgName} = args

    await this.configureIntegrationClient(app)
    let connection: Integration.SalesforceConnection
    try {
      ({body: connection} = await this.integration.delete<Integration.SalesforceConnection>(
        `/addons/${this.addonId}/connections/${orgName}`
      ))
    } catch (error) {
      const connErr = error as ConnectionError
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(`Salesforce org ${color.yellow(orgName)} not found or not connected to app ${color.app(app)}`, {exit: 1})
      } else {
        throw error
      }
    }

    ux.action.start(`Disconnecting Salesforce Org ${color.yellow(orgName)} from ${color.app(app)}`)
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
