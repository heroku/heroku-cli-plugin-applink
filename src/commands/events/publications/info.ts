import {flags} from '@heroku-cli/command'
import {Args, ux} from '@oclif/core'
import Command from '../../../lib/base'
import * as Events from '../../../lib/events/types'
import {humanizeKeys} from '../../../lib/helpers'

export default class Info extends Command {
  static description = 'shows info for a Heroku Events publication'

  static flags = {
    app: flags.app({required: true}),
    remote: flags.remote(),
  }

  static args = {
    pub_name_or_id: Args.string({description: 'Heroku Events publication name or id', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Info)
    const {app} = flags
    const {pub_name_or_id: pubNameOrId} = args

    await this.configureEventsClient(app)
    const {body: publication} = await this.events.get<Events.Publication>(
      `/v1/tenants/${this.tenant_id}/publications/${pubNameOrId}`
    )

    ux.styledObject({
      Id: publication.id,
      Name: publication.name,
      Platform: publication.platform,
      ...humanizeKeys(publication.params),
      // TODO: Are we guessing right that we should show 'sources' as well?
    })
  }
}
