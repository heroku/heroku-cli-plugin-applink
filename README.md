# @heroku-cli/plugin-applink

Heroku AppLink plugin

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@heroku-cli/plugin-applink.svg)](https://npmjs.org/package/@heroku-cli/plugin-applink)
[![Downloads/week](https://img.shields.io/npm/dw/@heroku-cli/plugin-applink.svg)](https://npmjs.org/package/@heroku-cli/plugin-applink)

<!-- toc -->

- [@heroku-cli/plugin-applink](#heroku-cliplugin-applink)
- [Usage](#usage)
- [JWT Authorization (Headless Authentication)](#jwt-authorization-headless-authentication)
- [Commands](#commands)
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

# JWT Authorization (Headless Authentication)

The AppLink plugin supports JWT (JSON Web Token) authorization for headless
authentication in CI/CD pipelines and automated workflows. JWT authorization eliminates the
need for interactive browser-based OAuth flows.

## Step-by-Step Setup Guide

### 1. Generate RSA Key Pair

```bash
# Generate private key and self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes

# Extract public key for connected app
openssl x509 -pubkey -noout -in server.crt > server.pub
```

### 2. Configure Connected App in Salesforce

Follow the official Salesforce documentation to create and configure your
connected app:

1. **[Create a Connected App](https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm)**
   - Enable OAuth Settings
   - Enable "Use digital signatures" and upload your certificate
   - Set Callback URL: `http://localhost:1717/OauthRedirect`
   - Select OAuth scopes (minimum: `api`, `refresh_token`)

2. **[Authorize an Org Using the JWT Flow](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_jwt_flow.htm)**
   - Review JWT flow requirements and security considerations

### 3. Pre-authorize Users

Follow the official Salesforce documentation for
[Managing Connected App Policies](https://help.salesforce.com/s/articleView?id=sf.connected_app_manage_oauth.htm):

In your connected app settings, click **Manage** > **Edit Policies**:

- Permitted Users: Select **Admin approved users are
  pre-authorized**
- Select specific profiles or permission sets to give access to your connected app.

### 4. Add JWT Authorization via CLI

```bash
# For Salesforce
heroku salesforce:authorizations:add:jwt my-auth \
  --app my-heroku-app \
  --client-id 3MVG9...NM0ZqZc9aT \
  --jwt-key-file server.key \
  --username api.user@mycompany.com

# For Data Cloud
heroku datacloud:authorizations:add:jwt my-auth \
  --app my-heroku-app \
  --client-id 3MVG9...NM0ZqZc9aT \
  --jwt-key-file server.key \
  --username api.user@mycompany.com
```

### 5. Use in Your Application

After authorizing, your application can retrieve credentials using the AppLink
SDKs. For example:

```javascript
const Applink = require('@heroku/applink');
const applink = new Applink();

// Retrieve authorization by developer name
const auth = await applink.getAuthorization('my-auth');
console.log('Access Token:', auth.access_token);
console.log('Instance URL:', auth.instance_url);

// Or retrieve by alias
const authByAlias = await applink.getAuthorizationByAlias('applink:my-auth');
```

## CI/CD Integration Examples

### GitHub Actions

```yaml
name: Deploy with AppLink JWT

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Heroku CLI
        run: |
          curl https://cli-assets.heroku.com/install.sh | sh
          heroku plugins:install @heroku-cli/plugin-applink

      - name: Add JWT Authorization
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
          JWT_PRIVATE_KEY: ${{ secrets.JWT_PRIVATE_KEY }}
          SF_CLIENT_ID: ${{ secrets.SF_CLIENT_ID }}
          SF_USERNAME: ${{ secrets.SF_USERNAME }}
        run: |
          echo "$JWT_PRIVATE_KEY" > /tmp/jwt.key
          heroku salesforce:authorizations:add:jwt ci-auth \
            --app my-app \
            --client-id $SF_CLIENT_ID \
            --jwt-key-file /tmp/jwt.key \
            --username $SF_USERNAME
          rm /tmp/jwt.key

      - name: Deploy to Heroku
        run: git push heroku main
```

### CircleCI

```yaml
version: 2.1

jobs:
  deploy:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - run:
          name: Setup Heroku
          command: |
            curl https://cli-assets.heroku.com/install.sh | sh
            heroku plugins:install @heroku-cli/plugin-applink
      - run:
          name: Add JWT Authorization
          command: |
            echo "$JWT_PRIVATE_KEY" > /tmp/jwt.key
            heroku salesforce:authorizations:add:jwt ci-auth \
              --app $HEROKU_APP_NAME \
              --client-id $SF_CLIENT_ID \
              --jwt-key-file /tmp/jwt.key \
              --username $SF_USERNAME
            rm /tmp/jwt.key

workflows:
  deploy:
    jobs:
      - deploy:
          context: production
```

## Security Best Practices

1. **Key Rotation**: Rotate JWT key pairs regularly (e.g., every 90 days).
2. **Key Storage**: Store private keys securely in secret managers (GitHub
   Secrets, AWS Secrets Manager, etc.).
3. **Access Control**: Use dedicated service accounts with minimal required
   permissions.
4. **Audit Logging**: Monitor authorization usage in [Salesforce Setup > Login
   History](https://help.salesforce.com/s/articleView?id=xcloud.sso_saml_login_history.htm&type=5).
5. **Key Protection**: Never commit private keys to version control (add `*.key`
   to `.gitignore`).

## SDK Reference

For complete SDK documentation and advanced usage, see:

- [AppLink SDK Documentation](https://devcenter.heroku.com/articles/heroku-applink)
- [Salesforce JWT Bearer Token Flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_jwt_flow.htm)

# Commands

<!-- commands -->

- [`heroku applink:authorizations`](#heroku-applinkauthorizations)
- [`heroku applink:authorizations:info DEVELOPER_NAME`](#heroku-applinkauthorizationsinfo-developer_name)
- [`heroku applink:connections`](#heroku-applinkconnections)
- [`heroku applink:connections:info CONNECTION_NAME`](#heroku-applinkconnectionsinfo-connection_name)
- [`heroku datacloud:authorizations:add DEVELOPER_NAME`](#heroku-datacloudauthorizationsadd-developer_name)
- [`heroku datacloud:authorizations:add:jwt DEVELOPER_NAME`](#heroku-datacloudauthorizationsaddjwt-developer_name)
- [`heroku datacloud:authorizations:remove DEVELOPER_NAME`](#heroku-datacloudauthorizationsremove-developer_name)
- [`heroku datacloud:connect CONNECTION_NAME`](#heroku-datacloudconnect-connection_name)
- [`heroku datacloud:data-action-target:create LABEL`](#heroku-dataclouddata-action-targetcreate-label)
- [`heroku datacloud:disconnect CONNECTION_NAME`](#heroku-dataclouddisconnect-connection_name)
- [`heroku salesforce:authorizations:add DEVELOPER_NAME`](#heroku-salesforceauthorizationsadd-developer_name)
- [`heroku salesforce:authorizations:add:jwt DEVELOPER_NAME`](#heroku-salesforceauthorizationsaddjwt-developer_name)
- [`heroku salesforce:authorizations:remove DEVELOPER_NAME`](#heroku-salesforceauthorizationsremove-developer_name)
- [`heroku salesforce:connect CONNECTION_NAME`](#heroku-salesforceconnect-connection_name)
- [`heroku salesforce:connect:jwt CONNECTION_NAME`](#heroku-salesforceconnectjwt-connection_name)
- [`heroku salesforce:disconnect CONNECTION_NAME`](#heroku-salesforcedisconnect-connection_name)
- [`heroku salesforce:publications`](#heroku-salesforcepublications)
- [`heroku salesforce:publish API_SPEC_FILE_DIR`](#heroku-salesforcepublish-api_spec_file_dir)

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

_See code:
[src/commands/applink/authorizations/index.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/applink/authorizations/index.ts)_

## `heroku applink:authorizations:info DEVELOPER_NAME`

show info for a Heroku AppLink authorized user

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
  show info for a Heroku AppLink authorized user
```

_See code:
[src/commands/applink/authorizations/info.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/applink/authorizations/info.ts)_

## `heroku applink:connections`

list Heroku AppLink connections

```
USAGE
  $ heroku applink:connections -a <value> [--addon <value>] [-r <value>]

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

DESCRIPTION
  list Heroku AppLink connections
```

_See code:
[src/commands/applink/connections/index.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/applink/connections/index.ts)_

## `heroku applink:connections:info CONNECTION_NAME`

show info for a Heroku AppLink connection

```
USAGE
  $ heroku applink:connections:info CONNECTION_NAME -a <value> [--addon <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name of the connected org

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use
      --addon=<value>   unique name or ID of an AppLink add-on

DESCRIPTION
  show info for a Heroku AppLink connection
```

_See code:
[src/commands/applink/connections/info.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/applink/connections/info.ts)_

## `heroku datacloud:authorizations:add DEVELOPER_NAME`

store a user's credentials for connecting a Data Cloud org to a Heroku app

```
USAGE
  $ heroku datacloud:authorizations:add DEVELOPER_NAME -a <value> [--addon <value>] [--browser <value>] [-l <value>] [-r
  <value>]

ARGUMENTS
  DEVELOPER_NAME  unique developer name for the authorization. Must begin with a letter, end with a letter or a number,
                  and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                  allowed.

FLAGS
  -a, --app=<value>        (required) app to run command against
  -l, --login-url=<value>  Salesforce login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  store a user's credentials for connecting a Data Cloud org to a Heroku app
```

_See code:
[src/commands/datacloud/authorizations/add.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/datacloud/authorizations/add.ts)_

## `heroku datacloud:authorizations:add:jwt DEVELOPER_NAME`

store credentials for connecting a Data Cloud org to a Heroku app using JWT
authorization

```
USAGE
  $ heroku datacloud:authorizations:add:jwt DEVELOPER_NAME -a <value> --client-id <value> --jwt-key-file <value> --username <value>
    [--addon <value>] [-l <value>] [-r <value>] [--alias <value>]

ARGUMENTS
  DEVELOPER_NAME  unique developer name for the authorization. Must begin with a letter, end with a letter or a number,
                  and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                  allowed.

FLAGS
  -a, --app=<value>           (required) app to run command against
  -l, --login-url=<value>     Salesforce login URL
  -r, --remote=<value>        git remote of app to use
      --addon=<value>         unique name or ID of an AppLink add-on
      --alias=<value>         [default: applink:{developer_name}] alias for authorization to retrieve 
                                          credentials via SDK
      --client-id=<value>     (required) ID of consumer key from your connected app
      --jwt-key-file=<value>  (required) path to file containing RSA private key in PEM format to authorize with
      --username=<value>      (required) Salesforce username authorized for the connected app

DESCRIPTION
  store a user’s credentials for connecting a Data Cloud org to a Heroku app a JWT auth token

EXAMPLES
  $ heroku datacloud:authorizations:add:jwt my-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com

  $ heroku datacloud:authorizations:add:jwt my-sandbox-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com \
    --login-url https://test.salesforce.com

  $ heroku datacloud:authorizations:add:jwt my-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com \
    --alias custom-alias
```

_See code:
[src/commands/datacloud/authorizations/add/jwt.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/datacloud/authorizations/add/jwt.ts)_

## `heroku datacloud:authorizations:remove DEVELOPER_NAME`

remove a Data Cloud authorization from a Heroku app

```
USAGE
  $ heroku datacloud:authorizations:remove DEVELOPER_NAME -a <value> [--addon <value>] [-c <value>] [-r <value>]

ARGUMENTS
  DEVELOPER_NAME  developer name of the Data Cloud authorization

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>  set to developer name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

DESCRIPTION
  remove a Data Cloud authorization from a Heroku app
```

_See code:
[src/commands/datacloud/authorizations/remove.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/datacloud/authorizations/remove.ts)_

## `heroku datacloud:connect CONNECTION_NAME`

connect a Data Cloud org to a Heroku app

```
USAGE
  $ heroku datacloud:connect CONNECTION_NAME -a <value> [--addon <value>] [--browser <value>] [-l <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name for the Data Cloud connection. Must begin with a letter, end with a letter or a number, and
                   between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                   allowed.

FLAGS
  -a, --app=<value>        (required) app to run command against
  -l, --login-url=<value>  Salesforce login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  connect a Data Cloud org to a Heroku app
```

_See code:
[src/commands/datacloud/connect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/datacloud/connect.ts)_

## `heroku datacloud:data-action-target:create LABEL`

create a Data Cloud data action target for a Heroku app

```
USAGE
  $ heroku datacloud:data-action-target:create LABEL -a <value> -o <value> -p <value> [--addon <value>] [-n <value>] [-t webhook] [-r
    <value>]

ARGUMENTS
  LABEL  label for the data action target. Must begin with a letter, end with a letter or a number, and between 3-30
         characters. Only alphanumeric characters and non-consecutive underscores ('_') are allowed.

FLAGS
  -a, --app=<value>              (required) app to run command against
  -n, --api-name=<value>         [default: <LABEL>] API name for the data action target
  -o, --connection-name=<value>  (required) Data Cloud connection name to create the data action target
  -p, --target-api-path=<value>  (required) API path for the data action target excluding app URL, eg "/" or
                                 "/handleDataCloudDataChangeEvent"
  -r, --remote=<value>           git remote of app to use
  -t, --type=<option>            [default: webhook] Data action target type
                                 <options: webhook>
      --addon=<value>            unique name or ID of an AppLink add-on

DESCRIPTION
  create a Data Cloud data action target for a Heroku app
```

_See code:
[src/commands/datacloud/data-action-target/create.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/datacloud/data-action-target/create.ts)_

## `heroku datacloud:disconnect CONNECTION_NAME`

disconnect a Data Cloud org from a Heroku app

```
USAGE
  $ heroku datacloud:disconnect CONNECTION_NAME -a <value> [--addon <value>] [-c <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name of the Data Cloud connection

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>  set to Data Cloud org connection name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

DESCRIPTION
  disconnect a Data Cloud org from a Heroku app
```

_See code:
[src/commands/datacloud/disconnect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/datacloud/disconnect.ts)_

## `heroku salesforce:authorizations:add DEVELOPER_NAME`

store a user's credentials for connecting a Salesforce org to a Heroku app

```
USAGE
  $ heroku salesforce:authorizations:add DEVELOPER_NAME -a <value> [--addon <value>] [--browser <value>] [-l <value>]
  [-r <value>]

ARGUMENTS
  DEVELOPER_NAME  unique developer name for the authorization. Must begin with a letter, end with a letter or a number,
                  and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                  allowed.

FLAGS
  -a, --app=<value>        (required) app to run command against
  -l, --login-url=<value>  Salesforce login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  store a user's credentials for connecting a Salesforce org to a Heroku app
```

_See code:
[src/commands/salesforce/authorizations/add.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/salesforce/authorizations/add.ts)_

## `heroku salesforce:authorizations:add:jwt DEVELOPER_NAME`

store credentials for connecting a Salesforce org to a Heroku app using JWT
authorization

```
USAGE
  $ heroku salesforce:authorizations:add:jwt DEVELOPER_NAME -a <value> --client-id <value> --jwt-key-file <value> --username <value>
    [--addon <value>] [-l <value>] [-r <value>] [--alias <value>]

ARGUMENTS
  DEVELOPER_NAME  unique developer name for the authorization. Must begin with a letter, end with a letter or a number,
                  and between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                  allowed.

FLAGS
  -a, --app=<value>           (required) app to run command against
  -l, --login-url=<value>     Salesforce login URL
  -r, --remote=<value>        git remote of app to use
      --addon=<value>         unique name or ID of an AppLink add-on
      --alias=<value>         Alias for the authorization (defaults to applink:{developer_name}). Used to retrieve
                              credentials via SDK.
      --client-id=<value>     (required) Consumer Key from your Connected App (found in Setup > App Manager > [Your App]
                              > View). Must match the key used to generate the JWT private key.
      --jwt-key-file=<value>  (required) Path to file containing RSA private key in PEM format. Generate with: openssl
                              req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes
      --username=<value>      (required) Salesforce username that has been authorized for the Connected App. Must be a
                              valid user in the target org.

DESCRIPTION
  store credentials for connecting a Salesforce org to a Heroku app using JWT authorization

  This command enables headless authentication using JWT Bearer Token Flow, ideal for CI/CD pipelines and automated
  workflows. Requires a Connected App configured with certificate-based authentication.

  Learn more: https://devcenter.heroku.com/articles/heroku-applink

EXAMPLES
  $ heroku salesforce:authorizations:add:jwt my-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com

  $ heroku salesforce:authorizations:add:jwt my-sandbox-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com \
    --login-url https://test.salesforce.com

  $ heroku salesforce:authorizations:add:jwt my-auth \
    --app my-app \
    --client-id 3MVG9...NM0ZqZc9aT \
    --jwt-key-file server.key \
    --username api.user@mycompany.com \
    --alias custom-alias
```

_See code:
[src/commands/salesforce/authorizations/add/jwt.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/salesforce/authorizations/add/jwt.ts)_

## `heroku salesforce:authorizations:remove DEVELOPER_NAME`

remove a Salesforce authorization from a Heroku app

```
USAGE
  $ heroku salesforce:authorizations:remove DEVELOPER_NAME -a <value> [--addon <value>] [-c <value>] [-r <value>]

ARGUMENTS
  DEVELOPER_NAME  developer name of the Salesforce authorization

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>  set to developer name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

DESCRIPTION
  remove a Salesforce authorization from a Heroku app
```

_See code:
[src/commands/salesforce/authorizations/remove.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/salesforce/authorizations/remove.ts)_

## `heroku salesforce:connect CONNECTION_NAME`

connect a Salesforce org to a Heroku app

```
USAGE
  $ heroku salesforce:connect CONNECTION_NAME -a <value> [--addon <value>] [--browser <value>] [-l <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name for the Salesforce connection.  Must begin with a letter, end with a letter or a number, and be
                   between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                   allowed.

FLAGS
  -a, --app=<value>        (required) app to run command against
  -l, --login-url=<value>  login URL
  -r, --remote=<value>     git remote of app to use
      --addon=<value>      unique name or ID of an AppLink add-on
      --browser=<value>    browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  connect a Salesforce org to a Heroku app
```

_See code:
[src/commands/salesforce/connect/index.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/salesforce/connect/index.ts)_

## `heroku salesforce:connect:jwt CONNECTION_NAME`

connect a Salesforce org to Heroku app using a JWT auth token

```
USAGE
  $ heroku salesforce:connect:jwt CONNECTION_NAME -a <value> --client-id <value> --jwt-key-file <value> --username <value>
    [--addon <value>] [-l <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name for the Salesforce connection.  Must begin with a letter, end with a letter or a number, and be
                   between 3-30 characters. Only alphanumeric characters and non-consecutive underscores ('_') are
                   allowed.

FLAGS
  -a, --app=<value>           (required) app to run command against
  -l, --login-url=<value>     Salesforce login URL
  -r, --remote=<value>        git remote of app to use
      --addon=<value>         unique name or ID of an AppLink add-on
      --client-id=<value>     (required) ID of consumer key
      --jwt-key-file=<value>  (required) path to file containing private key to authorize with
      --username=<value>      (required) Salesforce username

DESCRIPTION
  connect a Salesforce org to Heroku app using a JWT auth token
```

_See code:
[src/commands/salesforce/connect/jwt.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/salesforce/connect/jwt.ts)_

## `heroku salesforce:disconnect CONNECTION_NAME`

disconnect a Salesforce org from a Heroku app

```
USAGE
  $ heroku salesforce:disconnect CONNECTION_NAME -a <value> [--addon <value>] [-c <value>] [-r <value>]

ARGUMENTS
  CONNECTION_NAME  name of the Salesforce connection you would like to disconnect

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>  set to Salesforce connection name to bypass confirm prompt
  -r, --remote=<value>   git remote of app to use
      --addon=<value>    unique name or ID of an AppLink add-on

DESCRIPTION
  disconnect a Salesforce org from a Heroku app
```

_See code:
[src/commands/salesforce/disconnect.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/salesforce/disconnect.ts)_

## `heroku salesforce:publications`

list Salesforce orgs the app is published to

```
USAGE
  $ heroku salesforce:publications -a <value> [--addon <value>] [--connection_name <value>] [-r <value>]

FLAGS
  -a, --app=<value>              (required) app to run command against
  -r, --remote=<value>           git remote of app to use
      --addon=<value>            unique name or ID of an AppLink add-on
      --connection_name=<value>  name of the Salesforce connection

DESCRIPTION
  list Salesforce orgs the app is published to
```

_See code:
[src/commands/salesforce/publications.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/salesforce/publications.ts)_

## `heroku salesforce:publish API_SPEC_FILE_DIR`

publish an app's API specification to an authenticated Salesforce org

```
USAGE
  $ heroku salesforce:publish API_SPEC_FILE_DIR -a <value> -c <value> --connection-name <value> [--addon <value>]
    [--authorization-connected-app-name <value>] [--authorization-permission-set-name <value>] [--metadata-dir <value>]
    [-r <value>]

ARGUMENTS
  API_SPEC_FILE_DIR  path to OpenAPI 3.x spec file (JSON or YAML format)

FLAGS
  -a, --app=<value>                                (required) app to run command against
  -c, --client-name=<value>                        (required) name given to the client stub
  -r, --remote=<value>                             git remote of app to use
      --addon=<value>                              unique name or ID of an AppLink add-on
      --authorization-connected-app-name=<value>   name of connected app to create from our template
      --authorization-permission-set-name=<value>  name of permission set to create from our template
      --connection-name=<value>                    (required) authenticated Salesforce connection name
      --metadata-dir=<value>                       directory containing connected app, permission set, or API spec

DESCRIPTION
  publish an app's API specification to an authenticated Salesforce org
```

_See code:
[src/commands/salesforce/publish.ts](https://github.com/heroku/heroku-cli-plugin-applink/blob/v1.1.0/src/commands/salesforce/publish.ts)_

<!-- commandsstop -->
