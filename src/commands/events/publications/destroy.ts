import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
import confirmCommand from '../../../lib/confirmCommand'
import {color} from '@heroku-cli/color'

export default class Destroy extends Command {
  static description = 'unlinks and destroys a Heroku Events publication'

  static usage = 'heroku events:publications:destroy PUB_NAME_OR_ID -a <value> [-c <value>]'

  static flags = {
    app: flags.app({required: true}),
    confirm: flags.string({char: 'c'}),
    remote: flags.remote(),
  }

  static args = {
    pub_name_or_id: Args.string({description: 'Heroku Events publication name or id', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Destroy)
    const {app, confirm} = flags
    const {pub_name_or_id: pubNameOrId} = args

    await this.configureEventsClient(app)
    await confirmCommand(app, confirm)

    ux.action.start(`Destroying publication ${color.yellow(pubNameOrId)} on ${color.app(app)}`)
    await this.events.delete<void>(`/v1/tenants/${this.tenant_id}/publications/${pubNameOrId}`)
    ux.action.stop()
  }
}
