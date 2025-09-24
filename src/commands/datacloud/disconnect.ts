import {color} from '@heroku-cli/color'
import Command from '../../lib/base'
import {flags} from '@heroku-cli/command'
import * as AppLink from '../../lib/applink/types'
import {ux, Args} from '@oclif/core'
import {humanize} from '../../lib/helpers'
import heredoc from 'tsheredoc'
import {ConnectionError} from '../../lib/applink/types'
import confirmCommand from '../../lib/confirmCommand'

export default class Disconnect extends Command {
  static description = 'disconnect a Data Cloud org from a Heroku app'

  static flags = {
    addon: flags.string({description: 'unique name or ID of an AppLink add-on'}),
    app: flags.app({required: true}),
    confirm: flags.string({char: 'c', description: 'set to Data Cloud org connection name to bypass confirm prompt'}),
    remote: flags.remote(),
  }

  static args = {
    connection_name: Args.string({description: 'name of the Data Cloud connection', required: true}),
  }

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Disconnect)
    const {app, addon, confirm} = flags
    const {connection_name: connectionName} = args
    let dataActionTargets: AppLink.DataActionTarget[] = []
    let message: string | undefined

    await this.configureAppLinkClient(app, addon)

    try {
      const {body} = await this.applinkClient.get<AppLink.DataActionTarget[]>(
        `/addons/${this.addonId}/connections/datacloud/${connectionName}/data_action_targets`,
        {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        }
      )
      dataActionTargets = body || []
    } catch {
      ux.error('Failed to fetch data action targets for connection', {exit: 1})
    }

    if (dataActionTargets.length > 0) {
      const lines: string[] = []
      ux.table(dataActionTargets, {
        label: {header: 'DAT Name'},
      }, {
        printLine: (line: string) => lines.push(line),
      })

      const tableStr = lines.join('\n')
      const intro = heredoc`
          Destructive action
          This command disconnects the org ${color.bold.red(connectionName)} from add-on ${color.addon(this._addonName)} on app ${color.app(app)} and will delete the following data action targets:`

      message = `${intro}\n${tableStr}`
    }

    await confirmCommand({
      connectionName,
      connectionType: 'org',
      addon: this._addonName,
      app,
      confirm,
      message,
    })

    try {
      await this.applinkClient.delete<AppLink.DataCloudConnection>(
        `/addons/${this.addonId}/connections/${connectionName}`, {
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        }
      )
    } catch (error) {
      const connErr = error as ConnectionError
      if (connErr.body && connErr.body.id === 'record_not_found') {
        ux.error(
          heredoc`
          Data Cloud org ${color.yellow(connectionName)} doesn't exist on app ${color.app(app)}.
          Use ${color.cmd('heroku applink:connections')} to list the connections on the app.`, {exit: 1})
      } else {
        throw error
      }
    }

    ux.action.start(`Disconnecting Data Cloud connection ${color.yellow(connectionName)} from ${color.app(app)}`)
    ux.action.stop(humanize('Disconnected'))
  }
}
