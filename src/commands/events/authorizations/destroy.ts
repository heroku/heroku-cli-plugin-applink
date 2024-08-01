import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
import confirmCommand from '../../../lib/confirmCommand'
import {color} from '@heroku-cli/color'

export default class Destroy extends Command {
  static description = 'destroys a Heroku Events authorization'

  static usage = 'heroku events:authorizations:destroy AUTH_ID -a <value> [-c <value>]'

  static flags = {
    app: flags.app({required: true}),
    confirm: flags.string({char: 'c'}),
    remote: flags.remote(),
  }

  static args = {
    auth_id: Args.string({description: 'Heroku Events authorization id', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Destroy)
    const {app, confirm} = flags
    const {auth_id: authId} = args

    await this.configureEventsClient(app)
    await confirmCommand(app, confirm)

    ux.action.start(`Destroying authorization ${color.yellow(authId)} on ${color.app(app)}`)
    await this.events.delete<void>(`/v1/tenants/${this.tenant_id}/authorizations/${authId}`)
    ux.action.stop()
  }
}
