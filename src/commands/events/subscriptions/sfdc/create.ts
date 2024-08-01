import color from '@heroku-cli/color'
import {flags} from '@heroku-cli/command'
import {Args, ux} from '@oclif/core'
import heredoc from 'tsheredoc'
import Command from '../../../../lib/base'
import * as Events from '../../../../lib/events/types'

export default class Create extends Command {
  static description = 'creates a Salesforce Platform subscription'

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
      dependsOn: ['target'],
    }),
    'org-name': flags.string({
      char: 'o',
      description: 'authorized Salesforce Org instance name',
      required: true,
    }),
    remote: flags.remote(),
    target: flags.string({
      char: 't',
      description: 'existing publication name or id to link to',
    }),
  }

  static args = {
    name: Args.string({description: 'name to assign to the subscription created', required: true}),
  }

  static examples = [
    // TODO: add real examples here
    heredoc`
      # Create a Salesfore Platform subscription for Account Change events from 'my-org'.
      $ heroku events:subscriptions:sfdc:create accountChange -e "/data/AccountChange" -o my-org
    `,
  ]

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Create)
    const {app, event, filter, 'org-name': orgName, target} = flags
    const {name} = args

    await this.configureEventsClient(app)

    ux.action.start(`Creating subscription ${color.yellow(name)}`)
    await this.events.post<Events.Subscription>(
      `/v1/tenants/${this.tenant_id}/platforms/salesforce/subscriptions`,
      {
        body: {
          event: event,
          filter: filter,
          name: name,
          org_name: orgName,
          target: target,
        },
      }
    )
    ux.action.stop()
  }
}
