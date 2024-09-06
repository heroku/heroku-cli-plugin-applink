import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
import {createHash} from 'crypto'
import fs from 'fs'
import {gzipSync} from 'zlib'
import Command from '../../lib/base'
import * as Integration from '../../lib/integration/types'
import {humanize} from '../../lib/helpers'
import heredoc from 'tsheredoc'

export default class Import extends Command {
  static description = 'Imports an API specification to an authenticated Salesforce Org.'

  static flags = {
    app: flags.app({required: true}),
    'client-name': flags.string({required: true, char: 'c', description: 'name given to the client stub'}),
    'generate-auth-permission-set': flags.boolean({char: 'G', description: 'generate a permission set for the client'}),
    'org-name': flags.string({required: true, char: 'o', description: 'authorized Salesforce Org instance name'}),
    remote: flags.remote(),
  }

  static args = {
    api_spec_file: Args.file({required: true, description: 'OpenAPI 3.x spec file (JSON or YAML format)'}),
  }

  protected isPendingState(state: string): boolean {
    return state !== 'imported' && state !== 'import_failed'
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Import)
    const {app, 'client-name': clientName, 'generate-auth-permission-set': generateAuthPermissionSet, 'org-name': orgName} = flags
    const {api_spec_file: apiSpecFile} = args

    const specFileContents = fs.readFileSync(apiSpecFile)
    const hexDigest = createHash('sha256').update(specFileContents).digest('hex')
    const compressedSpec = gzipSync(Buffer.from(specFileContents))
    const encodedSpec = Buffer.from(compressedSpec).toString('base64')

    await this.configureIntegrationClient(app)

    ux.action.start('Importing App')
    let importState: Integration.AppImport
    const {body: importRes} = await this.integration.post<Integration.AppImport>(
      `/addons/${this.addonId}/connections/salesforce/${orgName}/app_imports`,
      {
        body: {
          client_name: clientName,
          api_spec: encodedSpec,
          generate_authorization_permission_set: generateAuthPermissionSet,
          hex_digest: hexDigest,
        },
      })
    let {state, error} = importRes

    while (this.isPendingState(state)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: importState} = await this.integration.get<Integration.AppImport>(
        `/addons/${this.addonId}/connections/salesforce/${orgName}/app_imports/${clientName}`,
      ))

      // ({state, error} = importState)
      state = importState.state
      error = importState.error
      ux.action.status = humanize(state)
    }

    ux.action.stop(humanize(state))

    if (state !== 'imported') {
      ux.error(
        error === undefined ?
          humanize(state) :
          heredoc`
            ${error.id}
            ${error.message}
          `,
        {exit: 1}
      )
    }
  }
}
