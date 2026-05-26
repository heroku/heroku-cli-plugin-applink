import {expect} from 'chai';

import {adjustOrgType} from '../../../src/lib/applink/types.js';

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
});
