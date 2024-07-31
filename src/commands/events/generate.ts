import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as Events from '../../lib/events/types'
import {Args, ux} from '@oclif/core'
import color from '@heroku-cli/color'
import heredoc from 'tsheredoc'

export default class Generate extends Command {
  static description = 'creates an event generator'

  static flags = {
    app: flags.app({required: true}),
    filter: flags.string({
      char: 'f',
      description: 'filter to apply when linking to target',
      dependsOn: ['target'],
    }),
    interval: flags.string({
      char: 'i',
      description: 'how often to trigger the event',
      required: true,
    }),
    mapping: flags.string({
      char: 'm',
      description: 'the payload to be generated',
      required: true,
    }),
    remote: flags.remote(),
    target: flags.string({
      char: 't',
      description: 'existing publication id or name to link to',
    }),
  }

  static args = {
    name: Args.string({description: 'name to assign to the event generator', required: true}),
  }

  static examples = [
    // TODO: add real examples here
    heredoc`
      # Create an event generator named "my-generator" that triggers every minute
      $ heroku events:generate my-generator -i "1m" -m "root = {this}" -a my-app
    `,
  ]

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Generate)
    const {app, filter, interval, mapping, target} = flags
    const {name} = args

    await this.configureEventsClient(app)

    ux.action.start(`Creating event generator ${color.yellow(name)}`)
    await this.events.post<Events.Subscription>(
      `/v1/tenants/${this.tenant_id}/platforms/generate/subscriptions`,
      {
        body: {
          filter: filter || null,
          interval: interval,
          mapping: mapping,
          name: name,
          target: target,
        },
      }
    )
    ux.action.stop()
  }
}
