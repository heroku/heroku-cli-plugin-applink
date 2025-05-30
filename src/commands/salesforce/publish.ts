import {color} from '@heroku-cli/color'
import {flags} from '@heroku-cli/command'
import {ux, Args} from '@oclif/core'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import Command from '../../lib/base'
import * as AppLink from '../../lib/applink/types'
import AdmZip from 'adm-zip'

export default class Publish extends Command {
  static description = 'publish an app\'s API specification to an authenticated Salesforce org'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    'client-name': flags.string({required: true, char: 'c', description: 'name given to the client stub'}),
    'connection-name': flags.string({required: true, description: 'authenticated Salesforce connection name'}),
    'authorization-connected-app-name': flags.string({description: 'name of connected app to create from our template'}),
    'authorization-permission-set-name': flags.string({description: 'name of permission set to create from our template'}),
    'metadata-dir': flags.string({description: 'directory containing connected app, permission set, or API spec'}),
    remote: flags.remote(),
  }

  static args = {
    api_spec_file_dir: Args.file({required: true, description: 'path to OpenAPI 3.x spec file (JSON or YAML format)'}),
  }

  protected createZipArchive = async (files: AppLink.FileEntry[]) => {
    const zipArchive = new AdmZip()
    files.forEach(file => zipArchive.addFile(file.name, file.content))
    return zipArchive.toBuffer()
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Publish)
    const {app, addon, 'client-name': clientName, 'connection-name': connectionName, 'authorization-connected-app-name': authorizationConnectedAppName, 'authorization-permission-set-name': authorizationPermissionSetName, 'metadata-dir': metadataDir} = flags
    const {api_spec_file_dir: apiSpecFileDir} = args

    let hasConnectedAppMetadata = false
    let hasPermissionSetMetadata = false

    const files: AppLink.FileEntry[] = []

    if (!fs.existsSync(apiSpecFileDir)) {
      ux.error(`The API spec file path ${apiSpecFileDir} doesn't exist. Make sure it's the correct path or use a different one, and try again`, {exit: 1})
    }

    const fileExtension = path.extname(apiSpecFileDir).toLowerCase()

    if (!['.yaml', '.yml', '.json'].includes(fileExtension)) {
      ux.error('API spec file path must be in YAML (.yaml/.yml) or JSON (.json) format', {exit: 1})
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
        ux.error('You can only specify the connected app name with connectedapp-meta.xml in the metadata directory or with the --authorization-connected-app-name flag, not both.', {exit: 1})
      }

      if (hasPermissionSetMetadata && authorizationPermissionSetName) {
        ux.error('You can only specify the permission set name with permissionset-meta.xml in the metadata directory or with the --authorization-permission-set-name flag, not both.', {exit: 1})
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

    const compressedContent = await this.createZipArchive(files)
    const appRequestContent = {
      client_name: clientName,
      authorization_connected_app_name: authorizationConnectedAppName,
      authorization_permission_set_name: authorizationPermissionSetName,
    }
    const formData = new FormData()
    formData.append('metadata', new Blob([
      compressedContent,
    ], {
      type: 'application/zip',
    }
    ))
    formData.append('app_request', new Blob([
      JSON.stringify(appRequestContent),
    ], {
      type: 'application/json',
    }))

    await this.configureAppLinkClient(app, addon)

    const publishURL = `https://${this._applink.defaults.host}/addons/${this.addonId}/connections/salesforce/${connectionName}/apps`
    const headers = this._applink.defaults.headers || {}

    ux.action.start(`Publishing ${color.app(app)} to ${color.yellow(connectionName)} as ${color.yellow(clientName)}`)

    await axios.post(publishURL, formData, {
      headers: {
        accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${this._applinkToken}`,
        'x-addon-sso': headers['x-addon-sso'],
        'x-app-uuid': headers['x-app-uuid'],
        'User-Agent': headers['user-agent'],
      },
    }).catch(error => {
      if (error.response.data && error.response.data.message) {
        ux.error(error.response.data.message, {exit: 1})
      } else {
        throw error
      }
    })

    ux.action.stop()
  }
}
