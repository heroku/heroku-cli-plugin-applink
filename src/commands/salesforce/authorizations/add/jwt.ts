import JWTAuthCommand from '../../../../lib/jwtAuthCommand';

/**
 * Store JWT credentials for Salesforce org authorization.
 *
 * This command uses JWT Bearer Token Flow for headless authentication,
 * suitable for CI/CD pipelines and automated workflows.
 *
 * @see https://devcenter.heroku.com/articles/heroku-applink
 */
export default class JWT extends JWTAuthCommand {
  static description =
    'store credentials for connecting a Salesforce org to a Heroku app using JWT authorization';

  protected get providerName(): string {
    return 'salesforce';
  }

  protected get providerDisplayName(): string {
    return 'Salesforce';
  }

  protected get commandName(): string {
    return 'salesforce:authorizations:add:jwt';
  }

  static examples = JWTAuthCommand.generateExamples(
    'salesforce:authorizations:add:jwt'
  );
}
