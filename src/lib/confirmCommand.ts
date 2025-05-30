import {color} from '@heroku-cli/color'
import {ux} from '@oclif/core'
import heredoc from 'tsheredoc'

export default async function confirmCommand({
  connectionName,
  connectionType,
  addon,
  app,
  confirm,
  message,
}: {
  connectionName: string,
  connectionType: string,
  addon: string,
  app: string,
  confirm?: string,
  message?: string,
}) {
  if (confirm) {
    if (confirm === connectionName) return
    ux.error(`Confirmation ${color.bold.red(confirm)} doesn't match ${color.bold.red(connectionName)}. Re-run this command to try again.`, {exit: 1})
  }

  if (!message) {
    message = heredoc`
      Destructive action
      This command disconnects the ${connectionType} ${color.bold.red(connectionName)} from add-on ${color.addon(addon)} on app ${color.app(app)}.
    `
  }

  ux.warn(message)
  console.error()
  const entered = await ux.prompt(
    `To proceed, type ${color.bold.red(connectionName)} or re-run this command with ${color.bold.red('--confirm', connectionName)}`,
    {required: true},
  )
  if (entered === connectionName) {
    return
  }

  ux.error(`Confirmation ${color.bold.red(entered)} doesn't match ${color.bold.red(connectionName)}. Re-run this command to try again.`, {exit: 1})
}
