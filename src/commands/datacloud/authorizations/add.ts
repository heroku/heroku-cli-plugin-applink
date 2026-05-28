import {flags} from '@heroku-cli/command';
import * as color from '@heroku/heroku-cli-util/color';
import {anykey} from '@heroku/heroku-cli-util/hux';
import {Args} from '@oclif/core';
import {ux} from '@oclif/core/ux';
import open from 'open';

import * as AppLink from '../../../lib/applink/types.js';
import AppLinkCommand from '../../../lib/base.js';
import {humanize} from '../../../lib/helpers.js';

export default class Add extends AppLinkCommand {
  public static anykeyHandler: (message?: string) => Promise<string> = anykey;
  static args = {
    developer_name: Args.string({
      description:
        'unique developer name for the authorization. Must begin with a letter, end with a letter or a number,'
        + " and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.",
      required: true,
    }),
  };
  static description
    = "store a user's credentials for connecting a Data Cloud org to a Heroku app";
  static flags = {
    addon: flags.string({
      description: 'unique name or ID of an AppLink add-on',
    }),
    app: flags.app({required: true}),
    browser: flags.string({
      description:
        'browser to open OAuth flow with (example: "firefox", "safari")',
    }),
    'login-url': flags.string({
      char: 'l',
      description: 'Salesforce login URL',
    }),
    remote: flags.remote(),
    url: flags.boolean({
      hidden: true,
    }),
  };
  public static urlOpener: (
    ..._args: Parameters<typeof open>
  ) => ReturnType<typeof open> = open;

  protected isPendingStatus(status: string): boolean {
    return status === 'authorizing';
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Add);
    const {addon, app, browser, 'login-url': loginUrl, url} = flags;
    const {developer_name: developerName} = args;

    await this.configureAppLinkClient(app, addon);
    let authorization: AppLink.Authorization;
    ({body: authorization}
      = await this.applinkClient.post<AppLink.Authorization>(
        `/addons/${this.addonId}/authorizations/datacloud`,
        {
          body: {
            developer_name: developerName,
            login_url: loginUrl,
          },
          headers: {authorization: `Bearer ${this._applinkToken}`},
          retryAuth: false,
        },
      ));

    const {id, redirect_uri: redirectUri} = authorization;

    if (url) {
      ux.stdout(JSON.stringify(redirectUri));
      return;
    }

    process.stderr.write(`Opening browser to ${redirectUri}\n`);
    let urlDisplayed = false;
    const showBrowserError = () => {
      if (!urlDisplayed)
        ux.warn("We can't open the browser. Try again, or use a different browser.");
      urlDisplayed = true;
    };

    try {
      await Add.anykeyHandler(`Press any key to open up the browser to add credentials to ${color.app(app)} as ${color.yellow(developerName)}, or ${color.yellow('q')} to exit`);
    } catch (error) {
      const {message} = error as Error;
      ux.error(message, {exit: 1});
    }

    const cp = await Add.urlOpener(redirectUri as string, {
      wait: false,
      ...(browser ? {app: {name: browser}} : {}),
    });
    cp.on('error', (err: Error) => {
      ux.warn(err);
      showBrowserError();
    });
    cp.on('close', (code: number) => {
      if (code !== 0) showBrowserError();
    });

    ux.action.start(`Adding credentials to ${color.app(app)} as ${color.yellow(developerName)}`);
    let {status} = authorization;
    ux.action.status = humanize(status);

    /* eslint-disable no-await-in-loop */
    while (this.isPendingStatus(status)) {
      await new Promise(resolve => {
        setTimeout(resolve, 5000);
      });

      ({body: authorization}
        = await this.applinkClient.get<AppLink.Authorization>(
          `/addons/${this.addonId}/authorizations/${id}`,
          {
            headers: {authorization: `Bearer ${this._applinkToken}`},
            retryAuth: false,
          },
        ));

      ({status} = authorization);
      ux.action.status = humanize(status);
    }
    /* eslint-enable no-await-in-loop */

    ux.action.stop(humanize(status));
  }
}
