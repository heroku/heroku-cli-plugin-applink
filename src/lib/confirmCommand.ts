import * as color from '@heroku/heroku-cli-util/color';
import * as hux from '@heroku/heroku-cli-util/hux';
import { ux } from '@oclif/core/ux';
import tsheredoc from 'tsheredoc';

const heredoc = tsheredoc.default ?? tsheredoc;

export default async function confirmCommand({
  connectionName,
  connectionType,
  addon,
  app,
  confirm,
  message,
  promptFunction,
}: {
  connectionName: string;
  connectionType: string;
  addon: string;
  app: string;
  confirm?: string;
  message?: string;
  promptFunction?: (
    name: string,
    options?: { required?: boolean }
  ) => Promise<string>;
}) {
  if (confirm) {
    if (confirm === connectionName) return;
    ux.error(
      `Confirmation ${color.red(confirm)} doesn't match ${color.red(connectionName)}. Re-run this command to try again.`,
      { exit: 1 }
    );
  }

  if (!message) {
    message = heredoc`
      Destructive action
      This command disconnects the ${connectionType} ${color.red(connectionName)} from add-on ${color.addon(addon)} on app ${color.app(app)}.
    `;
  }

  ux.warn(message);
  console.error();
  const doPrompt = promptFunction || hux.prompt;
  const entered = await doPrompt(
    `To proceed, type ${color.red(connectionName)} or re-run this command with ${color.red('--confirm ' + connectionName)}`,
    { required: true }
  );
  if (entered === connectionName) {
    return;
  }

  ux.error(
    `Confirmation ${color.red(entered)} doesn't match ${color.red(connectionName)}. Re-run this command to try again.`,
    { exit: 1 }
  );
}
