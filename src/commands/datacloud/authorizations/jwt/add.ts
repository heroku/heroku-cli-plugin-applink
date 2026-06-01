import JWTAuthCommand from '../../../../lib/jwtAuthCommand.js';

export default class JWT extends JWTAuthCommand {
  static args = JWTAuthCommand.args;
  static description
    = "store a user's credentials for connecting a Data Cloud org to a Heroku app using a JWT auth token";
  static examples = JWTAuthCommand.generateExamples('datacloud:authorizations:jwt:add');
  static flags = JWTAuthCommand.flags;

  protected get commandName(): string {
    return 'datacloud:authorizations:jwt:add';
  }

  protected get providerDisplayName(): string {
    return 'Data Cloud';
  }

  protected get providerName(): string {
    return 'datacloud';
  }
}
