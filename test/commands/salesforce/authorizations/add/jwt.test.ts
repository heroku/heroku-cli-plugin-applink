import Cmd from '../../../../../src/commands/salesforce/authorizations/jwt/add.js';
import {
  authorization_jwt_authorized,
  authorization_jwt_authorizing,
  authorization_jwt_failed,
} from '../../../../helpers/fixtures.js';
import {createJWTAuthCommandTests} from '../../../../helpers/jwtAuthCommandTests.js';

createJWTAuthCommandTests({
  commandClass: Cmd,
  fixtures: {
    authorized: authorization_jwt_authorized,
    authorizing: authorization_jwt_authorizing,
    failed: authorization_jwt_failed,
  },
  providerName: 'salesforce',
});
