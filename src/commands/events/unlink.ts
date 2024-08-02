import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Events from '../../lib/events/types'
import {Args, ux} from '@oclif/core'

export default class Unlink extends Command {
  static description = 'unlinks a publication from a subscription'

  static flags = {
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  static args = {
    source: Args.string({description: 'name or id of an existing subscription', required: true}),
    target: Args.string({description: 'name or id of an existing publication', required: true}),
  }

  static examples = [
    '$ heroku events:unlink subAccountChange pubAccountChange -a my-app',
  ]

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Unlink)
    const {app} = flags
    const {source, target} = args

    await this.configureEventsClient(app)

    ux.action.start(`Unlinking ${target} from ${source}`)
    await this.events.delete<Events.Subscription>(`/v1/tenants/${this.tenant_id}/subscriptions/${source}/publications/${target}`)
    ux.action.stop()
  }
}
