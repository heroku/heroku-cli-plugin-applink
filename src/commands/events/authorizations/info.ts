import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Events from '../../../lib/events/types'
import {Args, ux} from '@oclif/core'
import {humanizeKeys} from '../../../lib/helpers'

export default class Info extends Command {
  static description = 'shows info for a Heroku Events authorization'

  static flags = {
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  static args = {
    auth_id: Args.string({description: 'Heroku Events authorization id', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Info)
    const {app} = flags
    const {auth_id: authId} = args

    await this.configureEventsClient(app)
    const {body: authorization} = await this.events.get<Events.Authorization>(
      `/v1/tenants/${this.tenant_id}/authorizations/${authId}`
    )

    ux.styledObject({
      Id: authorization.id,
      Platform: authorization.platform,
      ...humanizeKeys(authorization.params)})
  }
}
