import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
import confirmCommand from '../../../lib/confirmCommand'
import * as Events from '../../../lib/events/types'
import {color} from '@heroku-cli/color'

export default class Destroy extends Command {
  static description = 'unlinks and destroys a Heroku Events subscription'

  static usage = 'heroku events:subscriptions:destroy SUB_NAME_OR_ID -a <value> [-c <value>]'

  static flags = {
    app: flags.app({required: true}),
    confirm: flags.string({char: 'c'}),
    remote: flags.remote(),
  }

  static args = {
    sub_name_or_id: Args.string({description: 'Heroku Events subscription name or id', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Destroy)
    const {app, confirm} = flags
    const {sub_name_or_id: subNameOrId} = args

    await this.configureEventsClient(app)
    await confirmCommand(app, confirm)

    ux.action.start(`Destroying subscription ${color.yellow(subNameOrId)} on ${color.app(app)}`)
    await this.events.delete<Events.Subscription>(`/v1/tenants/${this.tenant_id}/subscriptions/${subNameOrId}`)
    ux.action.stop()
  }
}
