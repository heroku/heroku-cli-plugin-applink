import { expect } from 'chai';
import { humanize, humanizeKeys } from '../../src/lib/helpers.js';

describe('helpers', function () {
  describe('humanize', function () {
    it('converts snake_case to Title Case', function () {
      expect(humanize('hello_world')).to.equal('Hello World');
    });

    it('converts camelCase to separate words', function () {
      expect(humanize('helloWorld')).to.equal('Hello World');
    });

    it('handles undefined', function () {
      expect(humanize(undefined)).to.equal('');
    });

    it('handles null', function () {
      expect(humanize(null)).to.equal('');
    });

    it('handles empty string', function () {
      expect(humanize('')).to.equal('');
    });
  });

  describe('humanizeKeys', function () {
    it('converts object keys to humanized form and filters null values', function () {
      const result = humanizeKeys({
        first_name: 'John',
        last_name: 'Doe',
        middle_name: null,
      });
      expect(result).to.deep.equal({
        'First Name': 'John',
        'Last Name': 'Doe',
      });
    });

    it('returns empty object for all-null values', function () {
      const result = humanizeKeys({ foo: null, bar: null });
      expect(result).to.deep.equal({});
    });
  });
});
