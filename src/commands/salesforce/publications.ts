import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {styledHeader, table} from '@heroku/heroku-cli-util/hux';
import {ux} from '@oclif/core/ux';

import * as AppLink from '../../lib/applink/types.js';
import AppLinkCommand from '../../lib/base.js';

export default class Publications extends AppLinkCommand {
  static description = 'list Salesforce orgs the app is published to';
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({required: true}),
    connection_name: flags.string({
      description: 'name of the Salesforce connection',
    }),
    remote: flags.remote(),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(Publications);
    const {addon, app, connection_name: connectionName} = flags;
    const connections: AppLink.SalesforceConnection[] = [];
    const publications: AppLink.Publication[] = [];

    await this.configureAppLinkClient(app, addon);

    if (connectionName) {
      const {body: connectionResponse}
        = await this.applinkClient.get<AppLink.SalesforceConnection>(
          `/addons/${this.addonId}/connections/${connectionName}`,
          {
            headers: {authorization: `Bearer ${this._applinkToken}`},
            retryAuth: false,
          },
        );
      connections.push(connectionResponse);
    } else {
      const {body: connectionResponse} = await this.applinkClient.get<
        AppLink.SalesforceConnection[]
      >(`/addons/${this.addonId}/connections`, {
        headers: {authorization: `Bearer ${this._applinkToken}`},
        retryAuth: false,
      });
      connections.push(...connectionResponse);
    }

    if (connections.length === 0) {
      ux.error(
        `There are no Heroku AppLink connections for ${color.app(app)}.`,
        {exit: 1},
      );
    }

    const activeSFConnections = connections.filter(connection =>
      connection.org.type === 'SalesforceOrg'
        && connection.status === 'connected');
    if (activeSFConnections.length === 0) {
      ux.error(
        `There are no active Heroku AppLink connections for ${color.app(app)}.`,
        {exit: 1},
      );
    }

    for (const connection of activeSFConnections) {
      // eslint-disable-next-line no-await-in-loop
      const {body: pubs} = await this.applinkClient.get<
        AppLink.Publication[]
      >(
        `/addons/${this.addonId}/connections/salesforce/${connection.org.connection_name}/apps/${this._appId}`,
        {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        },
      );
      publications.push(...pubs);
    }

    if (publications.length === 0) {
      ux.stdout(`You haven't published ${color.app(app)} to a Salesforce org yet.`);
    } else {
      styledHeader(`Salesforce publications for app ${color.app(app)}`);

      table(publications, {
        connectionName: {
          get: row => row.connection_name,
          header: 'Connection Name',
        },
        createdBy: {
          get: row => row.created_by,
          header: 'Created By',
        },
        createdDate: {
          get: row => row.created_at,
          header: 'Created Date',
        },
        lastModified: {
          get: row => row.last_modified_at,
          header: 'Last Modified',
        },
        lastModifiedBy: {
          get: row => row.last_modified_by,
          header: 'Last Modified By',
        },
        orgId: {
          get: row => row.org_id,
          header: 'Org ID',
        },
      });
    }
  }
}
