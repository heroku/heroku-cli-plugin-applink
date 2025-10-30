import JWTAuthCommand from '../../../../lib/jwtAuthCommand';

/**
 * Store JWT credentials for Data Cloud org authorization.
 *
 * This command uses JWT Bearer Token Flow for headless authentication,
 * suitable for CI/CD pipelines and automated workflows.
 *
 * @see https://devcenter.heroku.com/articles/heroku-applink
 */
export default class JWT extends JWTAuthCommand {
  static description =
    'store credentials for connecting a Data Cloud org to a Heroku app using JWT authorization';

  protected get providerName(): string {
    return 'datacloud';
  }

  protected get providerDisplayName(): string {
    return 'Data Cloud';
  }

  protected get commandName(): string {
    return 'datacloud:authorizations:add:jwt';
  }

  static examples = JWTAuthCommand.generateExamples(
    'datacloud:authorizations:add:jwt'
  );
}
