import JWTAuthCommand from '../../../../lib/jwtAuthCommand.js';

export default class JWT extends JWTAuthCommand {
  static args = JWTAuthCommand.args;
  static description
    = "store a user's credentials for connecting a Salesforce org to a Heroku app using a JWT auth token";
  static examples = JWTAuthCommand.generateExamples('salesforce:authorizations:jwt:add');
  static flags = JWTAuthCommand.flags;

  protected get commandName(): string {
    return 'salesforce:authorizations:jwt:add';
  }

  protected get providerDisplayName(): string {
    return 'Salesforce';
  }

  protected get providerName(): string {
    return 'salesforce';
  }
}
