import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {Args} from '@oclif/core';
import {ux} from '@oclif/core/ux';
import AdmZip from 'adm-zip';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';

import * as AppLink from '../../lib/applink/types.js';
import AppLinkCommand from '../../lib/base.js';

export default class Publish extends AppLinkCommand {
  static args = {
    api_spec_file_dir: Args.file({
      description: 'path to OpenAPI 3.x spec file (JSON or YAML format)',
      required: true,
    }),
  };
  static description
    = "publish an app's API specification to an authenticated Salesforce org";
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({required: true}),
    'authorization-connected-app-name': flags.string({
      description: 'name of connected app to create from our template',
    }),
    'authorization-external-client-app-name': flags.string({
      description: 'specifies the external client connected app name',
    }),
    'authorization-permission-set-name': flags.string({
      description: 'name of permission set to create from our template',
    }),
    'client-name': flags.string({
      char: 'c',
      description: 'name given to the client stub',
      required: true,
    }),
    'connection-name': flags.string({
      description: 'authenticated Salesforce connection name',
      required: true,
    }),
    'metadata-dir': flags.string({
      description:
        'directory containing connected app, permission set, or API spec',
    }),
    remote: flags.remote(),
  };
  protected createZipArchive = async (files: AppLink.FileEntry[]) => {
    const zipArchive = new AdmZip();
    for (const file of files) zipArchive.addFile(file.name, file.content);
    return zipArchive.toBuffer();
  };

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Publish);
    const {
      addon,
      app,
      'authorization-connected-app-name': authorizationConnectedAppName,
      'authorization-external-client-app-name': authExternalClientAppName,
      'authorization-permission-set-name': authorizationPermissionSetName,
      'client-name': clientName,
      'connection-name': connectionName,
      'metadata-dir': metadataDir,
    } = flags;
    const {api_spec_file_dir: apiSpecFileDir} = args;

    let hasConnectedAppMetadata = false;
    let hasPermissionSetMetadata = false;

    const files: AppLink.FileEntry[] = [];

    if (authorizationConnectedAppName) {
      ux.warn(`${color.command('--authorization-connected-app-name')} is a deprecated flag. Use ${color.command('--authorization-external-client-app-name')} instead.`);
    }

    if (!fs.existsSync(apiSpecFileDir)) {
      ux.error(
        `The API spec file path ${apiSpecFileDir} doesn't exist. Make sure it's the correct path or use a different one, and try again.`,
        {exit: 1},
      );
    }

    const fileExtension = path.extname(apiSpecFileDir).toLowerCase();

    if (!['.json', '.yaml', '.yml'].includes(fileExtension)) {
      ux.error(
        'API spec file path must be in YAML (.yaml/.yml) or JSON (.json) format.',
        {exit: 1},
      );
    }

    const apiSpecContent = fs.readFileSync(apiSpecFileDir);
    const fileName
      = fileExtension === '.json' ? 'api-spec.json' : 'api-spec.yaml';
    files.push({
      content: apiSpecContent,
      name: fileName,
    });

    if (metadataDir) {
      const dirFiles = fs.readdirSync(path.resolve(metadataDir));
      hasConnectedAppMetadata = dirFiles.includes('connectedapp-meta.xml');
      hasPermissionSetMetadata = dirFiles.includes('permissionset-meta.xml');

      if (hasConnectedAppMetadata && authorizationConnectedAppName) {
        ux.error(
          'You can only specify the connected app name with connectedapp-meta.xml in the metadata directory or with the --authorization-connected-app-name flag, not both.',
          {exit: 1},
        );
      }

      if (hasPermissionSetMetadata && authorizationPermissionSetName) {
        ux.error(
          'You can only specify the permission set name with permissionset-meta.xml in the metadata directory or with the --authorization-permission-set-name flag, not both.',
          {exit: 1},
        );
      }

      if (hasConnectedAppMetadata) {
        const connectedAppContent = fs.readFileSync(path.join(metadataDir, 'connectedapp-meta.xml'));
        files.push({
          content: connectedAppContent,
          name: 'connectedapp-meta.xml',
        });
      }

      if (hasPermissionSetMetadata) {
        const permissionSetContent = fs.readFileSync(path.join(metadataDir, 'permissionset-meta.xml'));
        files.push({
          content: permissionSetContent,
          name: 'permissionset-meta.xml',
        });
      }
    }

    const compressedContent = await this.createZipArchive(files);
    const appRequestContent = {
      authorization_connected_app_name: authorizationConnectedAppName,
      authorization_external_client_app_name: authExternalClientAppName,
      authorization_permission_set_name: authorizationPermissionSetName,
      client_name: clientName,
    };
    const formData = new FormData();
    formData.append(
      'metadata',
      new Blob([new Uint8Array(compressedContent)], {
        type: 'application/zip',
      }),
    );
    formData.append(
      'app_request',
      new Blob([JSON.stringify(appRequestContent)], {
        type: 'application/json',
      }),
    );

    await this.configureAppLinkClient(app, addon);

    const publishURL = `https://${this._applink.defaults.host}/addons/${this.addonId}/connections/salesforce/${connectionName}/apps`;
    const headers = this._applink.defaults.headers || {};

    ux.action.start(`Publishing ${color.app(app)} to ${color.yellow(connectionName)} as ${color.yellow(clientName)}`);

    await axios
      .post(publishURL, formData, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this._applinkToken}`,
          'Content-Type': 'multipart/form-data',
          'User-Agent': headers['user-agent'],
          'x-addon-sso': headers['x-addon-sso'],
          'x-app-uuid': headers['x-app-uuid'],
        },
      })
      .catch(error => {
        if (error.response.data && error.response.data.message) {
          ux.error(error.response.data.message, {exit: 1});
        } else {
          throw error;
        }
      });

    ux.action.stop();
  }
}
