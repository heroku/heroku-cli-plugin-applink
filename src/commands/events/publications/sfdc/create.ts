import color from '@heroku-cli/color'
import {flags} from '@heroku-cli/command'
import {Args, ux} from '@oclif/core'
import heredoc from 'tsheredoc'
import Command from '../../../../lib/base'
import * as Events from '../../../../lib/events/types'

export default class Create extends Command {
  static description = 'creates a Salesforce Platform publication'

  static flags = {
    app: flags.app({required: true}),
    event: flags.string({
      char: 'e',
      description: 'event to publish to',
      required: true,
    }),
    filter: flags.string({
      char: 'f',
      description: 'filter to apply when linking to source',
      dependsOn: ['source'],
    }),
    'org-name': flags.string({
      char: 'o',
      description: 'authorized Salesforce Org instance name',
      required: true,
    }),
    remote: flags.remote(),
    source: flags.string({
      char: 's',
      description: 'existing subscription name or id to link to',
    }),
  }

  static args = {
    name: Args.string({description: 'name to assign to the publication created', required: true}),
  }

  static examples = [
    // TODO: add real examples here
    heredoc`
      # Create a Salesfore Platform event target that receives …
      $ heroku events:publications:sfdc:create systemStatus -e "/event/System_Status__e" -o my-org
    `,
  ]

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Create)
    const {app, event, filter, 'org-name': orgName, source} = flags
    const {name} = args

    await this.configureEventsClient(app)

    ux.action.start(`Creating publication ${color.yellow(name)}`)
    await this.events.post<Events.Publication>(
      `/v1/tenants/${this.tenant_id}/platforms/salesforce/publications`,
      {
        body: {
          event: event,
          filter: filter || null,
          name: name,
          org_name: orgName,
          source: source,
        },
      }
    )
    ux.action.stop()
  }
}
