@heroku-cli/plugin-integration
==============================

Heroku Integration CLI plugin


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@heroku-cli/plugin-integration.svg)](https://npmjs.org/package/@heroku-cli/plugin-integration)
[![Downloads/week](https://img.shields.io/npm/dw/@heroku-cli/plugin-integration.svg)](https://npmjs.org/package/@heroku-cli/plugin-integration)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
```sh-session
$ heroku plugins:install @heroku-cli/plugin-integration
$ heroku integration:COMMAND
running command...
$ heroku integration --help [COMMAND]
USAGE
  $ heroku integration:COMMAND
...
```
# Commands
<!-- commands -->
* [`heroku datacloud:connect ORG_NAME`](#heroku-datacloudconnect-org_name)
* [`heroku datacloud:data-action-target:create LABEL`](#heroku-dataclouddata-action-targetcreate-label)
* [`heroku datacloud:disconnect ORG_NAME`](#heroku-dataclouddisconnect-org_name)
* [`heroku integration:connections`](#heroku-integrationconnections)
* [`heroku integration:connections:info ORG_NAME`](#heroku-integrationconnectionsinfo-org_name)
* [`heroku integration:project PROJECT_NAME`](#heroku-integrationproject-project_name)
* [`heroku salesforce:connect ORG_NAME`](#heroku-salesforceconnect-org_name)
* [`heroku salesforce:disconnect ORG_NAME`](#heroku-salesforcedisconnect-org_name)
* [`heroku salesforce:import API_SPEC_FILE`](#heroku-salesforceimport-api_spec_file)

## `heroku datacloud:connect ORG_NAME`

connects a Data Cloud Org to a Heroku app

```
USAGE
  $ heroku datacloud:connect [ORG_NAME] -a <value> [--browser <value>] [-l <value>] [-r <value>]

ARGUMENTS
  ORG_NAME  Data Cloud Org instance name.  Must begin with a letter. Then allowed chars are alphanumeric and underscores
            '_' (non-consecutive). Must end with a letter or a number. Must be min 3, max 30 characters.

FLAGS
  -a, --app=<value>        (required) app to run command against
  -l, --login-url=<value>  login URL
  -r, --remote=<value>     git remote of app to use
  --browser=<value>        browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  connects a Data Cloud Org to a Heroku app
```

_See code: [dist/commands/datacloud/connect.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/datacloud/connect.ts)_

## `heroku datacloud:data-action-target:create LABEL`

creates a Data Cloud Data Action Target for a Heroku app

```
USAGE
  $ heroku datacloud:data-action-target:create [LABEL] -a <value> -o <value> -p <value> [-n <value>] [-t WebHook]

ARGUMENTS
  LABEL  Data Action Target label

FLAGS
  -a, --app=<value>              (required) app to run command against
  -n, --api-name=<value>         API name for the Data Action Target, default derived from label
  -o, --org-name=<value>         (required) authorized Data Cloud Org instance name where the Data Action Target is
                                 created
  -p, --target-api-path=<value>  (required) API path for the Data Action Target excluding app URL, eg "/" or
                                 "/handleDataCloudDataChangeEvent"
  -t, --type=<option>            [default: WebHook] Data Action Target type
                                 <options: WebHook>

DESCRIPTION
  creates a Data Cloud Data Action Target for a Heroku app
```

_See code: [dist/commands/datacloud/data-action-target/create.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/datacloud/data-action-target/create.ts)_

## `heroku datacloud:disconnect ORG_NAME`

disconnects a Data Cloud Org from a Heroku app

```
USAGE
  $ heroku datacloud:disconnect [ORG_NAME] -a <value>

ARGUMENTS
  ORG_NAME  Data Cloud Org instance name

FLAGS
  -a, --app=<value>  (required) app to run command against

DESCRIPTION
  disconnects a Data Cloud Org from a Heroku app
```

_See code: [dist/commands/datacloud/disconnect.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/datacloud/disconnect.ts)_

## `heroku integration:connections`

lists Heroku Integration connections

```
USAGE
  $ heroku integration:connections [-a <value>] [-r <value>]

FLAGS
  -a, --app=<value>     app to run command against
  -r, --remote=<value>  git remote of app to use

DESCRIPTION
  lists Heroku Integration connections
```

_See code: [dist/commands/integration/connections/index.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/integration/connections/index.ts)_

## `heroku integration:connections:info ORG_NAME`

shows info for a Heroku Integration connection

```
USAGE
  $ heroku integration:connections:info [ORG_NAME] -a <value> [-r <value>]

ARGUMENTS
  ORG_NAME  connected org name

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use

DESCRIPTION
  shows info for a Heroku Integration connection
```

_See code: [dist/commands/integration/connections/info.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/integration/connections/info.ts)_

## `heroku integration:project PROJECT_NAME`

generates a Heroku Integration project template

```
USAGE
  $ heroku integration:project [PROJECT_NAME] [-o <value>]

ARGUMENTS
  PROJECT_NAME  user assigned project name

FLAGS
  -o, --output-directory=<value>  output directory where files will be placed (defaults to ./{PROJECT_NAME})

DESCRIPTION
  generates a Heroku Integration project template
```

_See code: [dist/commands/integration/project.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/integration/project.ts)_

## `heroku salesforce:connect ORG_NAME`

connects a Salesforce Org to Heroku app

```
USAGE
  $ heroku salesforce:connect [ORG_NAME] -a <value> [--browser <value>] [-l <value>] [-r <value>] [-S]

ARGUMENTS
  ORG_NAME  Salesforce Org instance name.  Must begin with a letter. Then allowed chars are alphanumeric and underscores
            '_' (non-consecutive). Must end with a letter or a number. Must be min 3, max 30 characters.

FLAGS
  -S, --store-as-run-as-user  store user credentials
  -a, --app=<value>           (required) app to run command against
  -l, --login-url=<value>     login URL
  -r, --remote=<value>        git remote of app to use
  --browser=<value>           browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  connects a Salesforce Org to Heroku app
```

_See code: [dist/commands/salesforce/connect.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/salesforce/connect.ts)_

## `heroku salesforce:disconnect ORG_NAME`

disconnects a Salesforce Org from a Heroku app

```
USAGE
  $ heroku salesforce:disconnect [ORG_NAME] -a <value>

ARGUMENTS
  ORG_NAME  Salesforce Org instance name

FLAGS
  -a, --app=<value>  (required) app to run command against

DESCRIPTION
  disconnects a Salesforce Org from a Heroku app
```

_See code: [dist/commands/salesforce/disconnect.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/salesforce/disconnect.ts)_

## `heroku salesforce:import API_SPEC_FILE`

Imports an API specification to an authenticated Salesforce Org.

```
USAGE
  $ heroku salesforce:import [API_SPEC_FILE] -a <value> -c <value> -o <value> [-G] [-r <value>]

ARGUMENTS
  API_SPEC_FILE  OpenAPI 3.x spec file (JSON or YAML format)

FLAGS
  -G, --generate-auth-permission-set  generate a permission set for the client
  -a, --app=<value>                   (required) app to run command against
  -c, --client-name=<value>           (required) name given to the client stub
  -o, --org-name=<value>              (required) authorized Salesforce Org instance name
  -r, --remote=<value>                git remote of app to use

DESCRIPTION
  Imports an API specification to an authenticated Salesforce Org.
```

_See code: [dist/commands/salesforce/import.ts](https://github.com/heroku/heroku-cli-plugin-integration/blob/v0.0.8/dist/commands/salesforce/import.ts)_
<!-- commandsstop -->
