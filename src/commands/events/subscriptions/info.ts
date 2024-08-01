import {flags} from '@heroku-cli/command'
import {Args, ux} from '@oclif/core'
import Command from '../../../lib/base'
import * as Events from '../../../lib/events/types'
import {humanizeKeys} from '../../../lib/helpers'

export default class Info extends Command {
  static description = 'shows info for a Heroku Events subscription'

  static flags = {
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  static args = {
    sub_name_or_id: Args.string({description: 'Heroku Events subscription name or id', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Info)
    const {app} = flags
    const {sub_name_or_id: subNameOrId} = args

    await this.configureEventsClient(app)
    const {body: subscription} = await this.events.get<Events.Subscription>(
      `/v1/tenants/${this.tenant_id}/subscriptions/${subNameOrId}`
    )

    ux.styledObject({
      Id: subscription.id,
      Name: subscription.name,
      Platform: subscription.platform,
      ...humanizeKeys(subscription.params),
      // TODO: Are we guessing right that we should show 'targets' as well?
    })
  }
}
