import {color} from '@heroku-cli/color'
import {ux} from '@oclif/core'
import heredoc from 'tsheredoc'

export default async function confirmCommand(orgName: string, confirm?: string | undefined, message?: string) {
  if (confirm) {
    if (confirm === orgName) return
    throw new Error(`Confirmation ${color.bold.red(confirm)} did not match ${color.bold.red(orgName)}. Aborted.`)
  }

  if (!message) {
    message = heredoc`
      Destructive Action.
      This command will affect the org ${color.bold.red(orgName)}.
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

  throw new Error(`Confirmation did not match ${color.bold.red(orgName)}. Aborted.`)
}
