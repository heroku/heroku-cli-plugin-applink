import JWTAuthCommand from '../../../../lib/jwtAuthCommand';

/**
 * Store JWT credentials for Data Cloud org authorization.
 *
 * This command uses JWT Bearer Token Flow for headless authentication,
 * suitable for CI/CD pipelines and automated workflows where browser-based
 * OAuth is not possible.
 *
 * Prerequisites:
 * - A Connected App configured in your Data Cloud org with OAuth enabled
 * - The Connected App must use digital signatures (certificate-based authentication)
 * - A user with appropriate permissions authorized for the Connected App
 * - An RSA private/public key pair
 *
 * @see https://devcenter.heroku.com/articles/heroku-applink
 */
export default class JWT extends JWTAuthCommand {
  static description =
    'store credentials for connecting a Data Cloud org to a Heroku app using JWT authorization\n\n' +
    'This command enables headless authentication using JWT Bearer Token Flow, ' +
    'ideal for CI/CD pipelines and automated workflows. Requires a Connected App ' +
    'configured with certificate-based authentication.\n\n' +
    'Learn more: https://devcenter.heroku.com/articles/heroku-applink';

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
