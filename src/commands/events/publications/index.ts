import {color} from '@heroku-cli/color'
import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Events from '../../../lib/events/types'
import {ux} from '@oclif/core'
import {humanizeKeys} from '../../../lib/helpers'

export default class Index extends Command {
  static description = 'lists Heroku Events publications'

  static flags = {
    app: flags.app({required: true}),
    json: flags.boolean({char: 'j', description: 'output in json format'}),
    remote: flags.remote(),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Index)
    const {app, json} = flags

    await this.configureEventsClient(app)
    const {body: publications} = await this.events.get<Events.Publication[]>(`/v1/tenants/${this.tenant_id}/publications`)

    if (publications.length === 0) {
      ux.log(`No Heroku Events publications for app ${color.app(app)}.`)
    } else if (json) {
      ux.styledJSON(publications)
    } else {
      ux.styledHeader(`Heroku Events publications for app ${color.app(app)}`)

      ux.table(publications, {
        name: {},
        platform: {},
        details: {
          get(row): string {
            // TODO: Review details to show with the product owner. Showing all exposed params for now.
            return Object.entries(humanizeKeys(row.params)).map(([key, value]) => `${color.blue(key)}: ${value}`).join(', ')
          },
        },
      })
    }
  }
}
