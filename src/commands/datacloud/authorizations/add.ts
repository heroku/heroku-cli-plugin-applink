import { color } from '@heroku-cli/color';
import Command from '../../../lib/base';
import { flags } from '@heroku-cli/command';
import * as AppLink from '../../../lib/applink/types';
import { ux, Args } from '@oclif/core';
import open from 'open';
import { CLIError } from '@oclif/core/lib/errors';
import { humanize } from '../../../lib/helpers';

export default class Add extends Command {
  static description =
    "store a user's credentials for connecting a Data Cloud org to a Heroku app";

  static flags = {
    app: flags.app({ required: true }),
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    browser: flags.string({
      description:
        'browser to open OAuth flow with (example: "firefox", "safari")',
    }),
    'login-url': flags.string({
      char: 'l',
      description: 'Salesforce login URL',
    }),
    remote: flags.remote(),
  };

  static args = {
    developer_name: Args.string({
      description:
        "unique developer name for the authorization. Must begin with a letter, end with a letter or a number, and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.",
      required: true,
    }),
  };

  public static urlOpener: (
    ..._args: Parameters<typeof open>
  ) => ReturnType<typeof open> = open;

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(Add);
    const { addon, app, browser, 'login-url': loginUrl } = flags;
    const { developer_name: developerName } = args;

    await this.configureAppLinkClient(app, addon);
    let authorization: AppLink.Authorization;
    ({ body: authorization } =
      await this.applinkClient.post<AppLink.Authorization>(
        `/addons/${this.addonId}/authorizations/datacloud`,
        {
          headers: { authorization: `Bearer ${this._applinkToken}` },
          body: {
            login_url: loginUrl,
            developer_name: developerName,
          },
          retryAuth: false,
        }
      ));

    const { id, redirect_uri: redirectUri } = authorization;

    process.stderr.write(`Opening browser to ${redirectUri}\n`);
    let urlDisplayed = false;
    const showBrowserError = () => {
      if (!urlDisplayed)
        ux.warn(
          "We can't open the browser. Try again, or use a different browser."
        );
      urlDisplayed = true;
    };

    try {
      await ux.anykey(
        `Press any key to open up the browser to add credentials to ${color.app(app)} as ${color.yellow(developerName)}, or ${color.yellow('q')} to exit`
      );
    } catch (error) {
      const { message, oclif } = error as CLIError;
      ux.error(message, { exit: oclif?.exit || 1 });
    }

    const cp = await Add.urlOpener(redirectUri as string, {
      wait: false,
      ...(browser ? { app: { name: browser } } : {}),
    });
    cp.on('error', (err: Error) => {
      ux.warn(err);
      showBrowserError();
    });
    cp.on('close', (code: number) => {
      if (code !== 0) showBrowserError();
    });

    ux.action.start(
      `Adding credentials to ${color.app(app)} as ${color.yellow(developerName)}`
    );
    let { status } = authorization;
    ux.action.status = humanize(status);

    while (this.isPendingStatus(status)) {
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });

      ({ body: authorization } =
        await this.applinkClient.get<AppLink.Authorization>(
          `/addons/${this.addonId}/authorizations/${id}`,
          {
            headers: { authorization: `Bearer ${this._applinkToken}` },
            retryAuth: false,
          }
        ));

      ({ status } = authorization);
      ux.action.status = humanize(status);
    }

    ux.action.stop(humanize(status));
  }

  protected isPendingStatus(status: string): boolean {
    return status === 'authorizing';
  }
}
