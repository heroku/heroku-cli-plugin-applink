import Cmd from '../../../../../src/commands/datacloud/authorizations/add/jwt';
import {
  authorization_datacloud_jwt_authorized,
  authorization_datacloud_jwt_failed,
  authorization_datacloud_jwt_authorizing,
} from '../../../../helpers/fixtures';
import { createJWTAuthCommandTests } from '../../../../helpers/jwtAuthCommandTests';

// Use shared test suite with Data Cloud-specific configuration
createJWTAuthCommandTests({
  commandClass: Cmd,
  providerName: 'datacloud',
  fixtures: {
    authorized: authorization_datacloud_jwt_authorized,
    failed: authorization_datacloud_jwt_failed,
    authorizing: authorization_datacloud_jwt_authorizing,
  },
});
