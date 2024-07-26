import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Events from '../../../lib/events/types'
import {ux} from '@oclif/core'

export default class Index extends Command {
  static description = 'lists Heroku Events authorizations'

  static flags = {
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Index)
    const {app} = flags

    await this.configureEventsClient(app)
    const {body: authorizations} = await this.events.get<Events.Authorization[]>(`/v1/tenants/${this.tenant_id}/authorizations`)

    if (authorizations.length === 0) {
      ux.log(`No Heroku Events authorizations for app ${color.app(app)}.`)
    } else {
      ux.styledHeader(`Heroku Events authorizations for app ${color.app(app)}`)

      ux.table(authorizations, {
        id: {
          header: 'ID',
        },
        platform: {},
        details: {
          get(_row): string {
            return 'TBD' // TODO: add details to the table column
          },
        },
      })
    }
  }
}
