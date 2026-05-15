import {ux} from '@oclif/core/ux';
import {expect} from 'chai';
import sinon from 'sinon';

import confirmCommand from '../../src/lib/confirmCommand.js';
import stripAnsi from '../helpers/strip-ansi.js';

describe('confirmApp', function () {
  let warnStub: sinon.SinonStub;

  beforeEach(function () {
    warnStub = sinon.stub(ux, 'warn');
    sinon.stub(console, 'error');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should not error or prompt with confirm flag match', async function () {
    await confirmCommand({
      addon: 'addon',
      app: 'app',
      confirm: 'orgName',
      connectionName: 'orgName',
      connectionType: 'org',
    });
  });

  it('should err on confirm flag mismatch', async function () {
    try {
      await confirmCommand({
        addon: 'addon',
        app: 'app',
        confirm: 'nope',
        connectionName: 'orgName',
        connectionType: 'org',
      });
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(stripAnsi(error.message)).to.equal("Confirmation nope doesn't match orgName. Re-run this command to try again.");
    }
  });

  it('should not err on confirm prompt match', async function () {
    await confirmCommand({
      addon: 'addon',
      app: 'app',
      connectionName: 'orgName',
      connectionType: 'org',
      promptFunction: async () => 'orgName',
    });
    expect(warnStub.called).to.be.true;
    const warnMessage = stripAnsi(warnStub.firstCall.args[0]);
    expect(warnMessage).to.contain('Destructive action');
  });

  it('should display custom message', async function () {
    const customMessage = 'custom message';
    await confirmCommand({
      addon: 'addon',
      app: 'app',
      connectionName: 'orgName',
      connectionType: 'org',
      message: customMessage,
      promptFunction: async () => 'orgName',
    });
    expect(warnStub.called).to.be.true;
    expect(warnStub.firstCall.args[0]).to.contain(customMessage);
  });

  it('should err on confirm prompt mismatch', async function () {
    try {
      await confirmCommand({
        addon: 'addon',
        app: 'app',
        connectionName: 'orgName',
        connectionType: 'org',
        promptFunction: async () => 'nope',
      });
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(stripAnsi(error.message)).to.equal("Confirmation nope doesn't match orgName. Re-run this command to try again.");
    }
  });
});
