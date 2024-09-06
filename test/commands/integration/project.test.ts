import {expect} from 'chai'
import {runCommand} from '../../run-command'
import Cmd from '../../../src/commands/integration/project'
import * as sinon from 'sinon'
import Environment from 'yeoman-environment'

describe('integration:project', function () {
  let yeomanEnvRunSpy: sinon.SinonSpy
  const projectName = 'test-integration-project'
  const customOutputDirectory = './my-custom-directory'

  beforeEach(function () {
    yeomanEnvRunSpy = sinon.spy()
    sinon.stub(Cmd, 'yeomanEnvCreator').callsFake((args, opts) => {
      console.log(args, opts)
      return {
        lookup: () => true,
        run: yeomanEnvRunSpy,
      } as unknown as Environment
    })
  })

  afterEach(function () {
    sinon.restore()
  })

  context('without any option flags specified', function () {
    it('attempts to run the ‘salesforce-javascript’ sub-generator with the default output directory', async function () {
      await runCommand(Cmd, [
        projectName,
      ])

      expect(yeomanEnvRunSpy.calledWith(
        '@heroku/heroku-integration:salesforce-javascript',
        {
          projectName,
          outputDirectory: `./${projectName}`,
        },
      )).to.be.true
    })
  })

  context('with ‘--project-type’, ‘--language’ and ‘--output-directory’ flags', function () {
    it('attempts to run the expected sub-generator with the specified output directory', async function () {
      await runCommand(Cmd, [
        projectName,
        '--project-type=salesforce',
        '--language=javascript',
        `--output-directory=${customOutputDirectory}`,
      ])

      expect(yeomanEnvRunSpy.calledWith(
        '@heroku/heroku-integration:salesforce-javascript',
        {
          projectName,
          outputDirectory: customOutputDirectory,
        },
      )).to.be.true
    })
  })
})
