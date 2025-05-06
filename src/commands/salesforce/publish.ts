import {color} from '@heroku-cli/color'
import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
import {createHash} from 'crypto'
import fs from 'fs'
import path from 'path'
import {gzipSync} from 'zlib'
import Command from '../../lib/base'
import * as AppLink from '../../lib/applink/types'

export default class Publish extends Command {
  static description = 'publish an app\'s API specification to an authenticated Salesforce org'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    'client-name': flags.string({required: true, char: 'c', description: 'name given to the client stub'}),
    'connection-name': flags.string({required: true, char: 'o', description: 'authenticated Salesforce org instance name'}),
    'authorization-connected-app-name': flags.string({description: 'name of connected app to create from our template'}),
    'authorization-permission-set-name': flags.string({description: 'name of permission set to create from our template'}),
    'metadata-dir': flags.string({description: 'directory containing connected app, permission set, or API spec'}),
    remote: flags.remote(),
  }

  static args = {
    api_spec_file: Args.file({required: true, description: 'OpenAPI 3.x spec file (JSON or YAML format)'}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Publish)
    const {app, addon, 'client-name': clientName, 'connection-name': connectionName, 'authorization-connected-app-name': authorizationConnectedAppName, 'authorization-permission-set-name': authorizationPermissionSetName, 'metadata-dir': metadataDir} = flags
    const {api_spec_file: apiSpecFile} = args

    let hasConnectedAppMeta = false
    let hasPermissionSetMeta = false

    if (metadataDir) {
      try {
        const files = fs.readdirSync(path.resolve(metadataDir))
        hasConnectedAppMeta = files.includes('connectedapp-meta.xml')
        hasPermissionSetMeta = files.includes('permissionset-meta.xml')

        if (hasConnectedAppMeta && authorizationConnectedAppName) {
          this.error('Cannot specify both connectedapp-meta.xml in metadata directory and --authorization-connected-app-name flag')
        }

        if (hasPermissionSetMeta && authorizationPermissionSetName) {
          this.error('Cannot specify both permissionset-meta.xml in metadata directory and --authorization-permission-set-name flag')
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.error(`Failed to read metadata directory: ${error.message}`)
        } else {
          this.error('Failed to read metadata directory: Unknown error')
        }
      }
    }

    // const specFileContents = fs.readFileSync(apiSpecFile)
    // const hexDigest = createHash('sha256').update(specFileContents).digest('hex')
    // const compressedSpec = gzipSync(Buffer.from(specFileContents))
    // const encodedSpec = Buffer.from(compressedSpec).toString('base64')

    const metadataZip = ''
    const binaryMetadataZip = Buffer.from(metadataZip)

    await this.configureAppLinkClient(app, addon)

    ux.action.start(`Publishing ${color.app(app)} to ${color.yellow(connectionName)} as ${color.yellow(clientName)}`)

    await this.applinkClient.post<AppLink.AppPublish>(
      `/addons/${this.addonId}/connections/salesforce/${connectionName}/apps`,
      {
        body: {
          app_request: {
            client_name: clientName,
            authorization_connected_app_name: authorizationConnectedAppName,
            authorization_permission_set_name: authorizationPermissionSetName,
          },
          metadata: binaryMetadataZip,
        },
      })

    ux.action.stop()
  }
}
