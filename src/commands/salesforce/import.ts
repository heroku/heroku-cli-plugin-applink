import {color} from '@heroku-cli/color'
import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
import {createHash} from 'crypto'
import fs from 'fs'
import {gzipSync} from 'zlib'
import Command from '../../lib/base'
import * as AppLink from '../../lib/applink/types'
import {humanize} from '../../lib/helpers'
import heredoc from 'tsheredoc'

export default class Import extends Command {
  static description = 'Imports an API specification to an authenticated Salesforce Org.'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    'client-name': flags.string({required: true, char: 'c', description: 'name given to the client stub'}),
    'generate-auth-permission-set': flags.boolean({char: 'G', description: 'generate a permission set for the client'}),
    'org-name': flags.string({required: true, char: 'o', description: 'authorized Salesforce Org instance name'}),
    remote: flags.remote(),
  }

  static args = {
    api_spec_file: Args.file({required: true, description: 'OpenAPI 3.x spec file (JSON or YAML format)'}),
  }

  protected isPendingStatus(status: string): boolean {
    return status !== 'imported' && status !== 'import_failed'
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Import)
    const {app, addon, 'client-name': clientName, 'generate-auth-permission-set': generateAuthPermissionSet, 'org-name': orgName} = flags
    const {api_spec_file: apiSpecFile} = args

    const specFileContents = fs.readFileSync(apiSpecFile)
    const hexDigest = createHash('sha256').update(specFileContents).digest('hex')
    const compressedSpec = gzipSync(Buffer.from(specFileContents))
    const encodedSpec = Buffer.from(compressedSpec).toString('base64')

    await this.configureAppLinkClient(app, addon)

    ux.action.start(`Importing ${color.app(app)} to ${color.yellow(orgName)} as ${color.yellow(clientName)}`)
    let importStatus: AppLink.AppImport
    const {body: importRes} = await this.applinkClient.post<AppLink.AppImport>(
      `/addons/${this.addonId}/connections/salesforce/${orgName}/app_imports`,
      {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        body: {
          client_name: clientName,
          api_spec: encodedSpec,
          generate_authorization_permission_set: generateAuthPermissionSet,
          hex_digest: hexDigest,
        },
      })
    let {status, error} = importRes

    while (this.isPendingStatus(status)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      });

      ({body: importStatus} = await this.applinkClient.get<AppLink.AppImport>(
        `/addons/${this.addonId}/connections/salesforce/${orgName}/app_imports/${clientName}`,
      ))

      status = importStatus.status
      error = importStatus.error
      ux.action.status = humanize(status)
    }

    ux.action.stop(humanize(status))

    if (status !== 'imported') {
      ux.error(
        error === undefined
          ? humanize(status)
          : heredoc`
            ${error.id}
            ${error.message}
          `,
        {exit: 1}
      )
    }
  }
}
