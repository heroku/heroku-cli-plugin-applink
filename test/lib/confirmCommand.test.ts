/* eslint-disable mocha/no-setup-in-describe */
import {ux} from '@oclif/core'
import {expect, test} from '@oclif/test'
import confirmCommand from '../../src/lib/confirmCommand'

const stripAnsi = require('strip-ansi')

describe('confirmApp', function () {
  test
    .stdout()
    .stderr()
    .do(() => confirmCommand({
      orgName: 'orgName',
      addon: 'addon',
      app: 'app',
      confirm: 'orgName',
    }))
    .it('should not error or prompt with confirm flag match', ({stderr, stdout}) => {
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
    })

  test
    .stdout()
    .stderr()
    .do(() => confirmCommand({
      orgName: 'orgName',
      addon: 'addon',
      app: 'app',
      confirm: 'nope',
    }))
    .catch((error: Error) => {
      expect(stripAnsi(error.message)).to.equal('Confirmation nope doesn\'t match orgName. Re-run this command to try again.')
    })
    .it('should err on confirm flag mismatch')

  test
    .stdout()
    .stderr()
    .stub(ux, 'prompt', () => Promise.resolve('orgName'))
    .do(() => confirmCommand({
      orgName: 'orgName',
      addon: 'addon',
      app: 'app',
    }))
    .it('should not err on confirm prompt match', ({stderr, stdout}) => {
      expect(stderr).to.contain('Warning: Destructive action')
      expect(stdout).to.equal('')
    })

  const customMessage = 'custom message'

  test
    .stdout()
    .stderr()
    .stub(ux, 'prompt', () => Promise.resolve('orgName'))
    .do(() => confirmCommand({
      orgName: 'orgName',
      addon: 'addon',
      app: 'app',
      message: customMessage,
    }))
    .it('should display custom message', ({stderr, stdout}) => {
      expect(stderr).to.contain(customMessage)
      expect(stdout).to.equal('')
    })

  test
    .stub(ux, 'prompt', () => Promise.resolve('nope'))
    .do(() => confirmCommand({
      orgName: 'orgName',
      addon: 'addon',
      app: 'app',
    }))
    .catch((error: Error) => {
      expect(stripAnsi(error.message)).to.equal('Confirmation nope doesn\'t match orgName. Re-run this command to try again.')
    })
    .it('should err on confirm prompt mismatch')
})
