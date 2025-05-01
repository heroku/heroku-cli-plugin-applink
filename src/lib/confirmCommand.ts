import {color} from '@heroku-cli/color'
import {ux} from '@oclif/core'
import heredoc from 'tsheredoc'

export default async function confirmCommand({
  orgName,
  addon,
  app,
  confirm,
  message,
}: {
  orgName: string,
  addon: string,
  app: string,
  confirm?: string,
  message?: string,
}) {
  if (confirm) {
    if (confirm === orgName) return
    ux.error(`Confirmation ${color.bold.red(confirm)} doesn't match ${color.bold.red(orgName)}. Re-run this command to try again.`, {exit: 1})
  }

  if (!message) {
    message = heredoc`
      Destructive action
      This command disconnects the org ${color.bold.red(orgName)} from add-on ${color.addon(addon)} on app ${color.app(app)}.
    `
  }

  ux.warn(message)
  console.error()
  const entered = await ux.prompt(
    `To proceed, type ${color.bold.red(orgName)} or re-run this command with ${color.bold.red('--confirm', orgName)}`,
    {required: true},
  )
  if (entered === orgName) {
    return
  }

  ux.error(`Confirmation ${color.bold.red(entered)} doesn't match ${color.bold.red(orgName)}. Re-run this command to try again.`, {exit: 1})
}
