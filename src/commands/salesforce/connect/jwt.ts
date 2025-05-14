import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import fs from 'fs'
import {v4 as uuidv4} from 'uuid'
import {ux, Args} from '@oclif/core'
import {humanize} from '../../../lib/helpers'

export default class JWT extends Command {
  static description = 'connects a Salesforce Org to Heroku app using a JWT auth token'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    'client-id': flags.string({required: true, description: 'ID of consumer key'}),
    'jwt-key-file': flags.file({required: true, description: 'path to file containing private key to authorize with'}),
    'login-url': flags.string({char: 'l', description: 'Salesforce login URL'}),
    remote: flags.remote(),
    username: flags.string({required: true, description: 'Salesforce username'}),
  }

  static args = {
    connection_name: Args.string({description: 'name for the Salesforce connection.  Must begin with a letter. Then allowed chars are alphanumeric and underscores \'_\' (non-consecutive). Must end with a letter or a number. Must be min 3, max 30 characters.', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(JWT)
    const {addon, app, 'client-id': clientId, 'jwt-key-file': jwtKeyFile, username, 'login-url': loginUrl} = flags
    const {connection_name: connectionName} = args
    const keyFileContents = fs.readFileSync(jwtKeyFile).toString()

    await this.configureAppLinkClient(app, addon)

    ux.action.start(`Adding credentials for ${username} to ${app} as ${connectionName}`)

    const {body: credential} = await this.applinkClient.post<AppLink.CredsCredential>(
      `/addons/${this.addonId}/connections/salesforce/jwt`,
      {
        body: {
          alias: uuidv4(),
          connection_name: connectionName,
          options: {
            login_url: loginUrl,
            client_id: clientId,
            jwt_private_key: keyFileContents,
            username,
          },
        },
      }
    )

    ux.action.stop(humanize(credential.status))
  }
}
