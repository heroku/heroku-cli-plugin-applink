@heroku-cli/plugin-applink
==============================

Heroku AppLink plugin


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@heroku-cli/plugin-applink.svg)](https://npmjs.org/package/@heroku-cli/plugin-applink)
[![Downloads/week](https://img.shields.io/npm/dw/@heroku-cli/plugin-applink.svg)](https://npmjs.org/package/@heroku-cli/plugin-applink)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
```sh-session
$ heroku plugins:install @heroku-cli/plugin-applink
$ heroku applink:COMMAND
running command...
$ heroku applink --help [COMMAND]
USAGE
  $ heroku applink:COMMAND
...
```
# Commands
<!-- commands -->
* [`heroku applink:authorizations`](#heroku-applinkauthorizations)
* [`heroku applink:authorizations:info DEVELOPER_NAME`](#heroku-applinkauthorizationsinfo-developer_name)
* [`heroku applink:connections`](#heroku-applinkconnections)
* [`heroku applink:connections:info ORG_NAME`](#heroku-applinkconnectionsinfo-org_name)
* [`heroku datacloud:connect [ORG_NAME]`](#heroku-datacloudconnect-org_name)
* [`heroku datacloud:data-action-target:create LABEL`](#heroku-dataclouddata-action-targetcreate-label)
* [`heroku datacloud:disconnect ORG_NAME`](#heroku-dataclouddisconnect-org_name)
* [`heroku salesforce:authorize DEVELOPER_NAME`](#heroku-salesforceauthorize-developer_name)
* [`heroku salesforce:connect ORG_NAME`](#heroku-salesforceconnect-org_name)
* [`heroku salesforce:disconnect ORG_NAME`](#heroku-salesforcedisconnect-org_name)
* [`heroku salesforce:import API_SPEC_FILE`](#heroku-salesforceimport-api_spec_file)

## `heroku applink:authorizations`

list Heroku AppLink authorized users

```
USAGE
  $ heroku applink:authorizations -a <value> [--addon <value>] [-r <value>]

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

DESCRIPTION
  list Heroku AppLink authorized users
```

_See code: [src/commands/applink/authorizations/index.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/applink/authorizations/index.ts)_

## `heroku applink:authorizations:info DEVELOPER_NAME`

shows info for a Heroku AppLink authorized user

```
USAGE
  $ heroku applink:authorizations:info DEVELOPER_NAME -a <value> [--addon <value>] [-r <value>]

ARGUMENTS
  DEVELOPER_NAME  developer name of the authorization

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

DESCRIPTION
  shows info for a Heroku AppLink authorized user
```

_See code: [src/commands/applink/authorizations/info.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/applink/authorizations/info.ts)_

## `heroku applink:connections`

lists Heroku AppLink connections

```
USAGE
  $ heroku applink:connections -a <value> [--addon <value>] [-r <value>]

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

DESCRIPTION
  lists Heroku AppLink connections
```

_See code: [src/commands/applink/connections/index.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/applink/connections/index.ts)_

## `heroku applink:connections:info ORG_NAME`

shows info for a Heroku AppLink connection

```
USAGE
  $ heroku applink:connections:info ORG_NAME -a <value> [--addon <value>] [-r <value>]

ARGUMENTS
  ORG_NAME  connected org name

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

DESCRIPTION
  shows info for a Heroku AppLink connection
```

_See code: [src/commands/applink/connections/info.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/applink/connections/info.ts)_

## `heroku datacloud:connect [ORG_NAME]`

connect a Data Cloud Org to a Heroku app

```
USAGE
  $ heroku datacloud:connect [ORG_NAME] -a <value> [--addon <value>] [--browser <value>] [-l <value>] [-r <value>]

ARGUMENTS
  ORG_NAME  name for the Data Cloud Org instance

FLAGS
  -a, --app=<value>        (required) app to run command against
  -l, --login-url=<value>  Salesforce login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  connect a Data Cloud Org to a Heroku app
```

_See code: [src/commands/datacloud/connect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/datacloud/connect.ts)_

## `heroku datacloud:data-action-target:create LABEL`

creates a Data Cloud Data Action Target for a Heroku app

```
USAGE
  $ heroku datacloud:data-action-target:create LABEL -a <value> -o <value> -p <value> [--addon <value>] [-n <value>] [-t WebHook] [-r
    <value>]

ARGUMENTS
  LABEL  Data Action Target label

FLAGS
  -a, --app=<value>              (required) app to run command against
  -n, --api-name=<value>         [default: <LABEL>] API name for the data action target
  -o, --org-name=<value>         (required) connected Data Cloud org instance name to create the data action target
  -p, --target-api-path=<value>  (required) API path for the data action target excluding app URL, eg "/" or
                                 "/handleDataCloudDataChangeEvent"
  -r, --remote=<value>           git remote of app to use
  -t, --type=<option>            [default: WebHook] Data action target type
                                 <options: WebHook>
      --addon=<value>            unique name or ID of an AppLink add-on

DESCRIPTION
  creates a Data Cloud Data Action Target for a Heroku app
```

_See code: [src/commands/datacloud/data-action-target/create.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/datacloud/data-action-target/create.ts)_

## `heroku datacloud:disconnect ORG_NAME`

disconnects a Data Cloud org from a Heroku app

```
USAGE
  $ heroku datacloud:disconnect ORG_NAME -a <value> [--addon <value>] [-c <value>] [-r <value>]

ARGUMENTS
  ORG_NAME  name of the Data Cloud org instance

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>  set to Data Cloud org instance name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

DESCRIPTION
  disconnects a Data Cloud org from a Heroku app
```

_See code: [src/commands/datacloud/disconnect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/datacloud/disconnect.ts)_

## `heroku salesforce:authorize DEVELOPER_NAME`

store a user's credentials for connecting a Salesforce Org to a Heroku app

```
USAGE
  $ heroku salesforce:authorize DEVELOPER_NAME -a <value> [--addon <value>] [--browser <value>] [-l <value>] [-r
  <value>]

ARGUMENTS
  DEVELOPER_NAME  developer name for the authorization. Must begin with a letter, end with a letter or a number, and
                  between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                  allowed.

FLAGS
  -a, --app=<value>        (required) app to run command against
  -l, --login-url=<value>  Salesforce login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  store a user's credentials for connecting a Salesforce Org to a Heroku app
```

_See code: [src/commands/salesforce/authorize.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/salesforce/authorize.ts)_

## `heroku salesforce:connect ORG_NAME`

connects a Salesforce Org to Heroku app

```
USAGE
  $ heroku salesforce:connect ORG_NAME -a <value> [--addon <value>] [--browser <value>] [-l <value>] [-r <value>]

ARGUMENTS
  ORG_NAME  Salesforce Org instance name.  Must begin with a letter. Then allowed chars are alphanumeric and underscores
            '_' (non-consecutive). Must end with a letter or a number. Must be min 3, max 30 characters.

FLAGS
  -a, --app=<value>        (required) app to run command against
  -l, --login-url=<value>  login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  connects a Salesforce Org to Heroku app
```

_See code: [src/commands/salesforce/connect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/salesforce/connect.ts)_

## `heroku salesforce:disconnect ORG_NAME`

disconnect a Salesforce org from a Heroku app

```
USAGE
  $ heroku salesforce:disconnect ORG_NAME -a <value> [--addon <value>] [-c <value>] [-r <value>]

ARGUMENTS
  ORG_NAME  name of the Salesforce org instance

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>  set to Salesforce org instance name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

DESCRIPTION
  disconnect a Salesforce org from a Heroku app
```

_See code: [src/commands/salesforce/disconnect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/salesforce/disconnect.ts)_

## `heroku salesforce:import API_SPEC_FILE`

Imports an API specification to an authenticated Salesforce Org.

```
USAGE
  $ heroku salesforce:import API_SPEC_FILE -a <value> -c <value> -o <value> [--addon <value>] [-G] [-r <value>]

ARGUMENTS
  API_SPEC_FILE  OpenAPI 3.x spec file (JSON or YAML format)

FLAGS
  -G, --generate-auth-permission-set  generate a permission set for the client
  -a, --app=<value>                   (required) app to run command against
  -c, --client-name=<value>           (required) name given to the client stub
  -o, --org-name=<value>              (required) authorized Salesforce Org instance name
  -r, --remote=<value>                git remote of app to use
      --addon=<value>                 unique name or ID of an AppLink add-on

DESCRIPTION
  Imports an API specification to an authenticated Salesforce Org.
```

_See code: [src/commands/salesforce/import.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v0.0.11/src/commands/salesforce/import.ts)_
<!-- commandsstop -->
