import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Events from '../../../lib/events/types'
import {ux} from '@oclif/core'
import {humanizeKeys} from '../../../lib/helpers'

export default class Index extends Command {
  static description = 'lists Heroku Events subscriptions'

  static flags = {
    app: flags.app({required: true}),
    json: flags.boolean({char: 'j', description: 'output in json format'}),
    remote: flags.remote(),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Index)
    const {app, json} = flags

    await this.configureEventsClient(app)
    const {body: subscriptions} = await this.events.get<Events.Subscription[]>(`/v1/tenants/${this.tenant_id}/subscriptions`)

    if (subscriptions.length === 0) {
      ux.log(`No Heroku Events subscriptions for app ${color.app(app)}.`)
    } else if (json) {
      ux.styledJSON(subscriptions)
    } else {
      ux.styledHeader(`Heroku Events subscriptions for app ${color.app(app)}`)

      ux.table(subscriptions, {
        name: {},
        platform: {},
        details: {
          get(row): string {
            return Object.entries(humanizeKeys(row.params)).map(([key, value]) => `${color.blue(key)}: ${value}`).join(', ')
          },
        },
      })
    }
  }
}
