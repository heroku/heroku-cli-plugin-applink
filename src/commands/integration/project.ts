import {flags} from '@heroku-cli/command'
import {Args} from '@oclif/core'
import {createEnv} from 'yeoman-environment'
import Command from '../../lib/base'

export default class Project extends Command {
  static description = 'generates a Heroku Integration project template'

  static flags = {
    language: flags.string({
      char: 'l',
      default: 'javascript',                            // TODO: remove after adding more languages
      description: 'language (one of: javascript, …)',
      hidden: true,                                     // TODO: remove after adding more languages
      options: ['javascript'],
    }),
    'output-directory': flags.string({
      char: 'o',
      description: 'output directory where files will be placed (defaults to ./{PROJECT_NAME})',
    }),
    'project-type': flags.string({
      char: 't',
      default: 'salesforce',                                // TODO: remove after adding more project types
      description: 'project type (one of: salesforce, …)',
      hidden: true,                                         // TODO: remove after adding more project types
      options: ['salesforce'],
    }),
  }

  static args = {
    project_name: Args.string({description: 'user assigned project name', required: true}),
  }

  static yeomanEnvCreator = createEnv

  public async run(): Promise<void> {
    const {flags, args} = await this.parse(Project)
    const {language, 'project-type': projectType, 'output-directory': outputDirectory} = flags
    const {project_name: projectName} = args
    const yeomanEnv = Project.yeomanEnvCreator()

    yeomanEnv.lookup()
    yeomanEnv.run(
      `heroku-integration:${projectType}-${language}`, {
        projectName,
        outputDirectory: outputDirectory || `./${projectName}`,
      }
    )
  }
}
