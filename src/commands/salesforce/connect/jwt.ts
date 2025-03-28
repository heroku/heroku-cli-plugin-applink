import Command from '../../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../../lib/applink/types'
import open from 'open'
import fs from 'fs'
import {v4 as uuidv4} from 'uuid'

export default class Jwt extends Command {
  static description = 'connects a Salesforce Org to Heroku app'

  static flags = {
    'client-id': flags.string({required: true, description: 'connected app secret'}),
    'jwt-key-file': flags.file({required: true, description: 'the key file counterpart for the key informed when created the connected app'}),
    username: flags.string({required: true, description: 'the salesforce username'}),
    'login-url': flags.string({char: 'l', description: 'login URL'}),
    'store-as-run-as-user': flags.boolean({char: 'S', description: 'store user credentials'}),
  }

  public static urlOpener: (...args: Parameters<typeof open>) => ReturnType<typeof open> = open

  public async run(): Promise<void> {
    const {flags} = await this.parse(Jwt)
    const {'client-id': clientId, 'jwt-key-file': jwtKeyFile, username, 'login-url': loginUrl, 'store-as-run-as-user': storeAsRunAsUser} = flags
    const keyFileContents = fs.readFileSync(jwtKeyFile).toString()

    console.log('key file contents:', keyFileContents)

    await this.configureApplessIntegrationClient()
    let credential: AppLink.CredsCredential
    ({body: credential} = await this.applinkClient.post<AppLink.CredsCredential>(
      '/salesforce/oauth/jwt',
      {
        body: {
          destination: uuidv4(),
          alias: uuidv4(),
          options: {
            login_url: loginUrl,
            client_id: clientId,
            jwt_private_key: keyFileContents,
            username: username,
          },
        },
      }
    ))
  }
}
