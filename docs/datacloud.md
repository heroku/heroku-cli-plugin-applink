`heroku datacloud`
==================

manage Heroku app connections to a Data Cloud Org

* [`heroku datacloud:authorizations:add DEVELOPER_NAME`](#heroku-datacloudauthorizationsadd-developer_name)
* [`heroku datacloud:authorizations:jwt:add DEVELOPER_NAME`](#heroku-datacloudauthorizationsjwtadd-developer_name)
* [`heroku datacloud:authorizations:remove DEVELOPER_NAME`](#heroku-datacloudauthorizationsremove-developer_name)
* [`heroku datacloud:connect CONNECTION_NAME`](#heroku-datacloudconnect-connection_name)
* [`heroku datacloud:data-action-target:create LABEL`](#heroku-dataclouddata-action-targetcreate-label)
* [`heroku datacloud:disconnect CONNECTION_NAME`](#heroku-dataclouddisconnect-connection_name)

## `heroku datacloud:authorizations:add DEVELOPER_NAME`

store a user's credentials for connecting a Data Cloud org to a Heroku app

```
USAGE
  $ heroku datacloud:authorizations:add DEVELOPER_NAME -a <value> [--prompt] [--addon <value>] [--browser <value>] [-l <value>]
    [-r <value>]

ARGUMENTS
  DEVELOPER_NAME  unique developer name for the authorization. Must begin with a letter, end with a letter or a number,
                  and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                  allowed.

FLAGS
  -a, --app=<value>        (required) [env: HEROKU_APP] app to run command against
  -l, --login-url=<value>  Salesforce login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  store a user's credentials for connecting a Data Cloud org to a Heroku app
```

_See code: [src/commands/datacloud/authorizations/add.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/datacloud/authorizations/add.ts)_

## `heroku datacloud:authorizations:jwt:add DEVELOPER_NAME`

store a user's credentials for connecting a Data Cloud org to a Heroku app using a JWT auth token

```
USAGE
  $ heroku datacloud:authorizations:jwt:add DEVELOPER_NAME -a <value> --client-id <value> --jwt-key-file <value> --username <value>
    [--addon <value>] [--alias <value>] [-l <value>] [-r <value>]

ARGUMENTS
  DEVELOPER_NAME  unique developer name for the authorization. Must begin with a letter, end with a letter or number,
                  and be 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                  allowed.

FLAGS
  -a, --app=<value>           (required) [env: HEROKU_APP] app to run command against
  -l, --login-url=<value>     Salesforce login URL
  -r, --remote=<value>        git remote of app to use
      --addon=<value>         unique name or ID of an AppLink add-on
      --alias=<value>         [default: applink:{developer_name}] alias for authorization to retrieve credentials via
                              SDK
      --client-id=<value>     (required) ID of consumer key from your connected app
      --jwt-key-file=<value>  (required) path to file containing RSA private key in PEM format to authorize with
      --username=<value>      (required) Salesforce username authorized for the connected app

DESCRIPTION
  store a user's credentials for connecting a Data Cloud org to a Heroku app using a JWT auth token

EXAMPLES
  $ heroku datacloud:authorizations:jwt:add my-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com

  $ heroku datacloud:authorizations:jwt:add my-sandbox-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com \
    --login-url https://test.salesforce.com

  $ heroku datacloud:authorizations:jwt:add my-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com \
    --alias custom-alias
```

_See code: [src/commands/datacloud/authorizations/jwt/add.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/datacloud/authorizations/jwt/add.ts)_

## `heroku datacloud:authorizations:remove DEVELOPER_NAME`

remove a Data Cloud authorization from a Heroku app

```
USAGE
  $ heroku datacloud:authorizations:remove DEVELOPER_NAME -a <value> [--prompt] [--addon <value>] [-c <value>] [-r
  <value>]

ARGUMENTS
  DEVELOPER_NAME  developer name of the Data Cloud authorization

FLAGS
  -a, --app=<value>      (required) [env: HEROKU_APP] app to run command against
  -c, --confirm=<value>  set to developer name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  remove a Data Cloud authorization from a Heroku app
```

_See code: [src/commands/datacloud/authorizations/remove.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/datacloud/authorizations/remove.ts)_

## `heroku datacloud:connect CONNECTION_NAME`

connect a Data Cloud org to a Heroku app

```
USAGE
  $ heroku datacloud:connect CONNECTION_NAME -a <value> [--prompt] [--addon <value>] [--browser <value>] [-l <value>]
    [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name for the Data Cloud connection. Must begin with a letter, end with a letter or a number, and be
                   between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                   allowed.

FLAGS
  -a, --app=<value>        (required) [env: HEROKU_APP] app to run command against
  -l, --login-url=<value>  login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  connect a Data Cloud org to a Heroku app
```

_See code: [src/commands/datacloud/connect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/datacloud/connect.ts)_

## `heroku datacloud:data-action-target:create LABEL`

create a Data Cloud data action target for a Heroku app

```
USAGE
  $ heroku datacloud:data-action-target:create LABEL -a <value> -o <value> -p <value> [--prompt] [--addon <value>] [-n <value>] [-r
    <value>] [-t webhook]

ARGUMENTS
  LABEL  label for the data action target. Must begin with a letter, end with a letter or a number, and between 3-30
         characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.

FLAGS
  -a, --app=<value>              (required) [env: HEROKU_APP] app to run command against
  -n, --api-name=<value>         [default: <LABEL>] API name for the data action target
  -o, --connection-name=<value>  (required) Data Cloud connection name to create the data action target
  -p, --target-api-path=<value>  (required) API path for the data action target excluding app URL, eg "/" or
                                 "/handleDataCloudDataChangeEvent"
  -r, --remote=<value>           git remote of app to use
  -t, --type=<option>            [default: webhook] Data action target type
                                 <options: webhook>
      --addon=<value>            unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  create a Data Cloud data action target for a Heroku app
```

_See code: [src/commands/datacloud/data-action-target/create.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/datacloud/data-action-target/create.ts)_

## `heroku datacloud:disconnect CONNECTION_NAME`

disconnect a Data Cloud org from a Heroku app

```
USAGE
  $ heroku datacloud:disconnect CONNECTION_NAME -a <value> [--prompt] [--addon <value>] [-c <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name of the Data Cloud connection

FLAGS
  -a, --app=<value>      (required) [env: HEROKU_APP] app to run command against
  -c, --confirm=<value>  set to Data Cloud org connection name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  disconnect a Data Cloud org from a Heroku app
```

_See code: [src/commands/datacloud/disconnect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/datacloud/disconnect.ts)_
