`heroku salesforce`
===================

manage Heroku app connections to a Salesforce Org

* [`heroku salesforce:authorizations:add DEVELOPER_NAME`](#heroku-salesforceauthorizationsadd-developer_name)
* [`heroku salesforce:authorizations:jwt:add DEVELOPER_NAME`](#heroku-salesforceauthorizationsjwtadd-developer_name)
* [`heroku salesforce:authorizations:remove DEVELOPER_NAME`](#heroku-salesforceauthorizationsremove-developer_name)
* [`heroku salesforce:connect CONNECTION_NAME`](#heroku-salesforceconnect-connection_name)
* [`heroku salesforce:connect:jwt CONNECTION_NAME`](#heroku-salesforceconnectjwt-connection_name)
* [`heroku salesforce:disconnect CONNECTION_NAME`](#heroku-salesforcedisconnect-connection_name)
* [`heroku salesforce:publications`](#heroku-salesforcepublications)
* [`heroku salesforce:publish API_SPEC_FILE_DIR`](#heroku-salesforcepublish-api_spec_file_dir)

## `heroku salesforce:authorizations:add DEVELOPER_NAME`

store a user's credentials for connecting a Salesforce org to a Heroku app

```
USAGE
  $ heroku salesforce:authorizations:add DEVELOPER_NAME -a <value> [--prompt] [--addon <value>] [--browser <value>] [-l <value>]
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
  store a user's credentials for connecting a Salesforce org to a Heroku app
```

_See code: [src/commands/salesforce/authorizations/add.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/salesforce/authorizations/add.ts)_

## `heroku salesforce:authorizations:jwt:add DEVELOPER_NAME`

store a user's credentials for connecting a Salesforce org to a Heroku app using a JWT auth token

```
USAGE
  $ heroku salesforce:authorizations:jwt:add DEVELOPER_NAME -a <value> --client-id <value> --jwt-key-file <value> --username <value>
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
  store a user's credentials for connecting a Salesforce org to a Heroku app using a JWT auth token

EXAMPLES
  $ heroku salesforce:authorizations:jwt:add my-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com

  $ heroku salesforce:authorizations:jwt:add my-sandbox-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com \
    --login-url https://test.salesforce.com

  $ heroku salesforce:authorizations:jwt:add my-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com \
    --alias custom-alias
```

_See code: [src/commands/salesforce/authorizations/jwt/add.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/salesforce/authorizations/jwt/add.ts)_

## `heroku salesforce:authorizations:remove DEVELOPER_NAME`

remove a Salesforce authorization from a Heroku app

```
USAGE
  $ heroku salesforce:authorizations:remove DEVELOPER_NAME -a <value> [--prompt] [--addon <value>] [-c <value>] [-r
  <value>]

ARGUMENTS
  DEVELOPER_NAME  developer name of the Salesforce authorization

FLAGS
  -a, --app=<value>      (required) [env: HEROKU_APP] app to run command against
  -c, --confirm=<value>  set to developer name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  remove a Salesforce authorization from a Heroku app
```

_See code: [src/commands/salesforce/authorizations/remove.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/salesforce/authorizations/remove.ts)_

## `heroku salesforce:connect CONNECTION_NAME`

connect a Salesforce org to a Heroku app

```
USAGE
  $ heroku salesforce:connect CONNECTION_NAME -a <value> [--prompt] [--addon <value>] [--browser <value>] [-l <value>]
    [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name for the Salesforce connection. Must begin with a letter, end with a letter or a number, and be
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
  connect a Salesforce org to a Heroku app
```

_See code: [src/commands/salesforce/connect/index.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/salesforce/connect/index.ts)_

## `heroku salesforce:connect:jwt CONNECTION_NAME`

connect a Salesforce org to Heroku app using a JWT auth token

```
USAGE
  $ heroku salesforce:connect:jwt CONNECTION_NAME -a <value> --client-id <value> --jwt-key-file <value> --username <value>
    [--prompt] [--addon <value>] [-l <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name for the Salesforce connection. Must begin with a letter, end with a letter or a number, and be
                   between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                   allowed.

FLAGS
  -a, --app=<value>           (required) [env: HEROKU_APP] app to run command against
  -l, --login-url=<value>     Salesforce login URL
  -r, --remote=<value>        git remote of app to use
      --addon=<value>         unique name or ID of an AppLink add-on
      --client-id=<value>     (required) ID of consumer key
      --jwt-key-file=<value>  (required) path to file containing private key to authorize with
      --username=<value>      (required) Salesforce username

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  connect a Salesforce org to Heroku app using a JWT auth token
```

_See code: [src/commands/salesforce/connect/jwt.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/salesforce/connect/jwt.ts)_

## `heroku salesforce:disconnect CONNECTION_NAME`

disconnect a Salesforce org from a Heroku app

```
USAGE
  $ heroku salesforce:disconnect CONNECTION_NAME -a <value> [--prompt] [--addon <value>] [-c <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name of the Salesforce connection you would like to disconnect

FLAGS
  -a, --app=<value>      (required) [env: HEROKU_APP] app to run command against
  -c, --confirm=<value>  set to Salesforce connection name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  disconnect a Salesforce org from a Heroku app
```

_See code: [src/commands/salesforce/disconnect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/salesforce/disconnect.ts)_

## `heroku salesforce:publications`

list Salesforce orgs the app is published to

```
USAGE
  $ heroku salesforce:publications -a <value> [--prompt] [--addon <value>] [--connection_name <value>] [-r <value>]

FLAGS
  -a, --app=<value>              (required) [env: HEROKU_APP] app to run command against
  -r, --remote=<value>           git remote of app to use
      --addon=<value>            unique name or ID of an AppLink add-on
      --connection_name=<value>  name of the Salesforce connection

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  list Salesforce orgs the app is published to
```

_See code: [src/commands/salesforce/publications.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/salesforce/publications.ts)_

## `heroku salesforce:publish API_SPEC_FILE_DIR`

publish an app's API specification to an authenticated Salesforce org

```
USAGE
  $ heroku salesforce:publish API_SPEC_FILE_DIR -a <value> -c <value> --connection-name <value> [--prompt] [--addon
    <value>] [--authorization-connected-app-name <value>] [--authorization-external-client-app-name <value>]
    [--authorization-permission-set-name <value>] [--metadata-dir <value>] [-r <value>]

ARGUMENTS
  API_SPEC_FILE_DIR  path to OpenAPI 3.x spec file (JSON or YAML format)

FLAGS
  -a, --app=<value>                                     (required) [env: HEROKU_APP] app to run command against
  -c, --client-name=<value>                             (required) name given to the client stub
  -r, --remote=<value>                                  git remote of app to use
      --addon=<value>                                   unique name or ID of an AppLink add-on
      --authorization-connected-app-name=<value>        name of connected app to create from our template
      --authorization-external-client-app-name=<value>  specifies the external client connected app name
      --authorization-permission-set-name=<value>       name of permission set to create from our template
      --connection-name=<value>                         (required) authenticated Salesforce connection name
      --metadata-dir=<value>                            directory containing connected app, permission set, or API spec

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  publish an app's API specification to an authenticated Salesforce org
```

_See code: [src/commands/salesforce/publish.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v2.0.5/src/commands/salesforce/publish.ts)_
