import {color} from '@heroku-cli/color'
import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
import fs from 'fs'
import path from 'path'
import {gzipSync} from 'zlib'
import Command from '../../lib/base'
import * as AppLink from '../../lib/applink/types'

interface FileEntry {
  name: string;
  content: string; // base64 encoded content
}

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

    let hasConnectedAppMetadata = false
    let hasPermissionSetMetadata = false

    // Store files with their metadata
    const files: FileEntry[] = []

    try {
      const apiSpecContent = fs.readFileSync(apiSpecFile)
      const fileExtension = path.extname(apiSpecFile).toLowerCase()

      if (fileExtension === '.yaml' || fileExtension === '.yml') {
        files.push({
          name: 'api-spec.yaml',
          content: apiSpecContent.toString('base64'),
        })
      } else if (fileExtension === '.json') {
        files.push({
          name: 'api-spec.json',
          content: apiSpecContent.toString('base64'),
        })
      } else {
        this.error('API spec file must be either YAML (.yaml/.yml) or JSON (.json) format')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Failed to read API spec file: ${error.message}`)
      } else {
        this.error('Failed to read API spec file: Unknown error')
      }
    }

    if (metadataDir) {
      try {
        const dirFiles = fs.readdirSync(path.resolve(metadataDir))
        hasConnectedAppMetadata = dirFiles.includes('connectedapp-meta.xml')
        hasPermissionSetMetadata = dirFiles.includes('permissionset-meta.xml')

        if (hasConnectedAppMetadata && authorizationConnectedAppName) {
          this.error('Cannot specify both connectedapp-meta.xml in metadata directory and --authorization-connected-app-name flag')
        }

        if (hasPermissionSetMetadata && authorizationPermissionSetName) {
          this.error('Cannot specify both permissionset-meta.xml in metadata directory and --authorization-permission-set-name flag')
        }

        if (hasConnectedAppMetadata) {
          const connectedAppContent = fs.readFileSync(path.join(metadataDir, 'connectedapp-meta.xml'))
          files.push({
            name: 'connectedapp-meta.xml',
            content: connectedAppContent.toString('base64'),
          })
        }

        if (hasPermissionSetMetadata) {
          const permissionSetContent = fs.readFileSync(path.join(metadataDir, 'permissionset-meta.xml'))
          files.push({
            name: 'permissionset-meta.xml',
            content: permissionSetContent.toString('base64'),
          })
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.error(`Failed to read metadata directory: ${error.message}`)
        } else {
          this.error('Failed to read metadata directory: Unknown error')
        }
      }
    }

    // Create a JSON structure containing all files
    const archiveContent = JSON.stringify(files)
    // Compress the JSON structure
    const compressedContent = gzipSync(Buffer.from(archiveContent))
    const binaryMetadataZip = Buffer.from(compressedContent).toString('base64')

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
