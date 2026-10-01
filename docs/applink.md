`heroku applink`
================

access information and generate Heroku AppLink projects

* [`heroku applink:authorizations`](#heroku-applinkauthorizations)
* [`heroku applink:authorizations:info DEVELOPER_NAME`](#heroku-applinkauthorizationsinfo-developer_name)
* [`heroku applink:connections`](#heroku-applinkconnections)
* [`heroku applink:connections:info CONNECTION_NAME`](#heroku-applinkconnectionsinfo-connection_name)

## `heroku applink:authorizations`

list Heroku AppLink authorized users

```
USAGE
  $ heroku applink:authorizations -a <value> [--prompt] [--addon <value>] [-r <value>]

FLAGS
  -a, --app=<value>     (required) [env: HEROKU_APP] app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  list Heroku AppLink authorized users
```

_See code: [src/commands/applink/authorizations/index.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/applink/authorizations/index.ts)_

## `heroku applink:authorizations:info DEVELOPER_NAME`

show info for a Heroku AppLink authorized user

```
USAGE
  $ heroku applink:authorizations:info DEVELOPER_NAME -a <value> [--prompt] [--addon <value>] [-r <value>]

ARGUMENTS
  DEVELOPER_NAME  developer name of the authorization

FLAGS
  -a, --app=<value>     (required) [env: HEROKU_APP] app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  show info for a Heroku AppLink authorized user
```

_See code: [src/commands/applink/authorizations/info.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/applink/authorizations/info.ts)_

## `heroku applink:connections`

list Heroku AppLink connections

```
USAGE
  $ heroku applink:connections -a <value> [--prompt] [--addon <value>] [-r <value>]

FLAGS
  -a, --app=<value>     (required) [env: HEROKU_APP] app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  list Heroku AppLink connections
```

_See code: [src/commands/applink/connections/index.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/applink/connections/index.ts)_

## `heroku applink:connections:info CONNECTION_NAME`

show info for a Heroku AppLink connection

```
USAGE
  $ heroku applink:connections:info CONNECTION_NAME -a <value> [--prompt] [--addon <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name of the connected org

FLAGS
  -a, --app=<value>     (required) [env: HEROKU_APP] app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  show info for a Heroku AppLink connection
```

_See code: [src/commands/applink/connections/info.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/applink/connections/info.ts)_
