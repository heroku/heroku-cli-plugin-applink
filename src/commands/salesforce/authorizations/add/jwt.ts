import JWTAuthCommand from '../../../../lib/jwtAuthCommand';

/**
 * Store JWT credentials for Salesforce org authorization.
 *
 * This command uses JWT Bearer Token Flow for headless authentication,
 * suitable for CI/CD pipelines and automated workflows where browser-based
 * OAuth isn't possible.
 *
 * Prerequisites:
 * - A connected app configured in your Salesforce org with OAuth enabled
 * - The connected app must use digital signatures (certificate-based authentication)
 * - A user with appropriate permissions authorized for the connected app
 * - An RSA private/public key pair
 *
 * @see https://devcenter.heroku.com/articles/heroku-applink
 */
export default class JWT extends JWTAuthCommand {
  static description =
    'store credentials for connecting a Salesforce org to a Heroku app using JWT authorization\n\n' +
    'This command enables headless authentication using JWT Bearer Token Flow, ' +
    'ideal for CI/CD pipelines and automated workflows. Requires a Connected App ' +
    'configured with certificate-based authentication.\n\n' +
    'Learn more: https://devcenter.heroku.com/articles/heroku-applink';

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
