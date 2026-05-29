import Cmd from '../../../../../src/commands/salesforce/authorizations/jwt/add';
import {
  authorization_jwt_authorized,
  authorization_jwt_failed,
  authorization_jwt_authorizing,
} from '../../../../helpers/fixtures';
import { createJWTAuthCommandTests } from '../../../../helpers/jwtAuthCommandTests';

// Use shared test suite with Salesforce-specific configuration
createJWTAuthCommandTests({
  commandClass: Cmd,
  providerName: 'salesforce',
  fixtures: {
    authorized: authorization_jwt_authorized,
    failed: authorization_jwt_failed,
    authorizing: authorization_jwt_authorizing,
  },
});
