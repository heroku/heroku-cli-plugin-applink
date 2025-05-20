import {color} from '@heroku-cli/color'
import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
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
    'connection-name': flags.string({required: true, description: 'authenticated Salesforce org instance name'}),
    'authorization-connected-app-name': flags.string({description: 'name of connected app to create from our template'}),
    'authorization-permission-set-name': flags.string({description: 'name of permission set to create from our template'}),
    'metadata-dir': flags.string({description: 'directory containing connected app, permission set, or API spec'}),
    remote: flags.remote(),
  }

  static args = {
    api_spec_file_dir: Args.file({required: true, description: 'path to OpenAPI 3.x spec file (JSON or YAML format)'}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Publish)
    const {app, addon, 'client-name': clientName, 'connection-name': connectionName, 'authorization-connected-app-name': authorizationConnectedAppName, 'authorization-permission-set-name': authorizationPermissionSetName, 'metadata-dir': metadataDir} = flags
    const {api_spec_file_dir: apiSpecFileDir} = args

    let hasConnectedAppMetadata = false
    let hasPermissionSetMetadata = false

    const files: AppLink.FileEntry[] = []

    if (!fs.existsSync(apiSpecFileDir)) {
      ux.error(`API spec file not found: ${apiSpecFileDir}`, {exit: 1})
    }

    const fileExtension = path.extname(apiSpecFileDir).toLowerCase()

    if (!['.yaml', '.yml', '.json'].includes(fileExtension)) {
      ux.error('API spec file must be either YAML (.yaml/.yml) or JSON (.json) format', {exit: 1})
    }

    const apiSpecContent = fs.readFileSync(apiSpecFileDir)
    const fileName = fileExtension === '.json' ? 'api-spec.json' : 'api-spec.yaml'
    files.push({
      name: fileName,
      content: apiSpecContent,
    })

    if (metadataDir) {
      const dirFiles = fs.readdirSync(path.resolve(metadataDir))
      hasConnectedAppMetadata = dirFiles.includes('connectedapp-meta.xml')
      hasPermissionSetMetadata = dirFiles.includes('permissionset-meta.xml')

      if (hasConnectedAppMetadata && authorizationConnectedAppName) {
        ux.error('Cannot specify both connectedapp-meta.xml in metadata directory and --authorization-connected-app-name flag', {exit: 1})
      }

      if (hasPermissionSetMetadata && authorizationPermissionSetName) {
        ux.error('Cannot specify both permissionset-meta.xml in metadata directory and --authorization-permission-set-name flag', {exit: 1})
      }

      if (hasConnectedAppMetadata) {
        const connectedAppContent = fs.readFileSync(path.join(metadataDir, 'connectedapp-meta.xml'))
        files.push({
          name: 'connectedapp-meta.xml',
          content: connectedAppContent,
        })
      }

      if (hasPermissionSetMetadata) {
        const permissionSetContent = fs.readFileSync(path.join(metadataDir, 'permissionset-meta.xml'))
        files.push({
          name: 'permissionset-meta.xml',
          content: permissionSetContent,
        })
      }
    }

    const filesForJson = files.map(file => ({
      name: file.name,
      content: file.content.toString('base64'),
    }))

    const compressedContent = gzipSync(JSON.stringify(filesForJson))
    const binaryMetadataZip = compressedContent.toString('base64')

    await this.configureAppLinkClient(app, addon)

    ux.action.start(`Publishing ${color.app(app)} to ${color.yellow(connectionName)} as ${color.yellow(clientName)}`)

    await this.applinkClient.post<AppLink.AppPublish>(
      `/addons/${this.addonId}/connections/salesforce/${connectionName}/apps`,
      {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        body: {
          app_request: {
            client_name: clientName,
            authorization_connected_app_name: authorizationConnectedAppName,
            authorization_permission_set_name: authorizationPermissionSetName,
          },
          metadata_zip: binaryMetadataZip,
        },
        retryAuth: false,
      })

    ux.action.stop()
  }
}
