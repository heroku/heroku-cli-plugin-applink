import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Integration from '../../../lib/integration/types'
import {Args, ux} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

export default class Info extends Command {
  static description = 'shows info for a Heroku Integration connection'

  static flags = {
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  static args = {
    org_name: Args.string({description: 'connected org name', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Info)
    const {app} = flags
    const {org_name: orgName} = args

    await this.configureIntegrationClient(app)
    const {body: connection} = await this.integration.get<Integration.Connection>(
      `/addons/${this.addonId}/connections/${orgName}`
    )

    ux.styledObject({
      Id: connection.id,
      'Instance URL': connection.salesforce_org.instance_url,
      'Org ID': connection.salesforce_org.id,
      'Org Name': connection.salesforce_org.org_name,
      'Run As User': connection.salesforce_org.run_as_user,
      State: humanize(connection.state),
      Type: humanize(connection.type),
    })
  }
}
