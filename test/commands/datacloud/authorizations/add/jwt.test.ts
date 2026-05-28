import Cmd from '../../../../../src/commands/datacloud/authorizations/jwt/add.js';
import {
  authorization_datacloud_jwt_authorized,
  authorization_datacloud_jwt_authorizing,
  authorization_datacloud_jwt_failed,
} from '../../../../helpers/fixtures.js';
import {createJWTAuthCommandTests} from '../../../../helpers/jwtAuthCommandTests.js';

createJWTAuthCommandTests({
  commandClass: Cmd,
  fixtures: {
    authorized: authorization_datacloud_jwt_authorized,
    authorizing: authorization_datacloud_jwt_authorizing,
    failed: authorization_datacloud_jwt_failed,
  },
  providerName: 'datacloud',
});
