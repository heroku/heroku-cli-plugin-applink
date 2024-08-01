import color from '@heroku-cli/color'
import {flags} from '@heroku-cli/command'
import {Args, ux} from '@oclif/core'
import heredoc from 'tsheredoc'
import Command from '../../../../lib/base'
import * as Events from '../../../../lib/events/types'

export default class Create extends Command {
  static description = 'creates a webhook publication'

  static flags = {
    app: flags.app({required: true}),
    filter: flags.string({
      char: 'f',
      description: 'filter to apply when linking to source',
      dependsOn: ['source'],
    }),
    remote: flags.remote(),
    source: flags.string({
      char: 's',
      description: 'existing subscription name or id to link to',
    }),
    token: flags.string({
      char: 't',
      description: 'access token',
    }),
    url: flags.string({
      char: 'u',
      description: 'webhook URL',
      required: true,
    }),
  }

  static args = {
    name: Args.string({description: 'name to assign to the publication created', required: true}),
  }

  static examples = [
    // TODO: add real examples here
    heredoc`
      # Create a Webhook URL target
      $ heroku events:publications:webhook:create opportunityChanged -u "https://my-app.herokuapp.com/webhooks" -a my-app
    `,
  ]

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Create)
    const {app, filter, source, token, url} = flags
    const {name} = args

    await this.configureEventsClient(app)

    ux.action.start(`Creating publication ${color.yellow(name)}`)
    await this.events.post<Events.Publication>(
      `/v1/tenants/${this.tenant_id}/platforms/webhook/publications`,
      {
        body: {
          filter: filter,
          name: name,
          source: source,
          token: token,
          url: url,
        },
      }
    )
    ux.action.stop()
  }
}
