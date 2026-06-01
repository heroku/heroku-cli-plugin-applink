import {expect} from 'chai';

import {
  adjustOrgType,
  isDataCloudConnection,
  isSalesforceConnection,
} from '../../../src/lib/applink/types.js';
import {connection1} from '../../helpers/fixtures.js';

describe('applink/types', function () {
  describe('adjustOrgType', function () {
    it('normalizes DatacloudOrg to DataCloudOrg', function () {
      expect(adjustOrgType('DatacloudOrg')).to.equal('DataCloudOrg');
    });

    it('passes through DataCloudOrg unchanged', function () {
      expect(adjustOrgType('DataCloudOrg')).to.equal('DataCloudOrg');
    });

    it('passes through SalesforceOrg unchanged', function () {
      expect(adjustOrgType('SalesforceOrg')).to.equal('SalesforceOrg');
    });

    it('handles undefined', function () {
      expect(adjustOrgType()).to.equal(undefined);
    });
  });

  describe('isSalesforceConnection', function () {
    it('returns true for a SalesforceConnection', function () {
      expect(isSalesforceConnection(connection1)).to.equal(true);
    });
  });

  describe('isDataCloudConnection', function () {
    it('returns false for a SalesforceConnection', function () {
      expect(isDataCloudConnection(connection1)).to.equal(false);
    });
  });
});
