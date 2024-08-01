@heroku-cli/plugin-events
=================

Heroku Events CLI plugin


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@heroku-cli/plugin-events.svg)](https://npmjs.org/package/@heroku-cli/plugin-events)
[![Downloads/week](https://img.shields.io/npm/dw/@heroku-cli/plugin-events.svg)](https://npmjs.org/package/@heroku-cli/plugin-events)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
```sh-session
$ heroku plugins:install @heroku-cli/plugin-events
$ heroku events:COMMAND
running command...
$ heroku events --help [COMMAND]
USAGE
  $ heroku events:COMMAND
...
```
# Commands
<!-- commands -->
* [`heroku events:authorizations`](#heroku-eventsauthorizations)
* [`heroku heroku events:authorizations:destroy AUTH_ID -a <value> [-c <value>]`](#heroku-heroku-eventsauthorizationsdestroy-auth_id--a-value--c-value)
* [`heroku events:authorizations:info AUTH_ID`](#heroku-eventsauthorizationsinfo-auth_id)
* [`heroku events:authorizations:sfdc:create ORG_NAME`](#heroku-eventsauthorizationssfdccreate-org_name)
* [`heroku events:generate NAME`](#heroku-eventsgenerate-name)
* [`heroku events:publications`](#heroku-eventspublications)
* [`heroku events:publications:datacloud:create NAME`](#heroku-eventspublicationsdatacloudcreate-name)
* [`heroku heroku events:publications:destroy PUB_NAME_OR_ID -a <value> [-c <value>]`](#heroku-heroku-eventspublicationsdestroy-pub_name_or_id--a-value--c-value)
* [`heroku events:publications:info PUB_NAME_OR_ID`](#heroku-eventspublicationsinfo-pub_name_or_id)
* [`heroku events:publications:sfdc:create NAME`](#heroku-eventspublicationssfdccreate-name)
* [`heroku events:publications:webhook:create NAME`](#heroku-eventspublicationswebhookcreate-name)
* [`heroku events:subscriptions`](#heroku-eventssubscriptions)
* [`heroku heroku events:subscriptions:destroy SUB_NAME_OR_ID -a <value> [-c <value>]`](#heroku-heroku-eventssubscriptionsdestroy-sub_name_or_id--a-value--c-value)
* [`heroku events:subscriptions:info SUB_NAME_OR_ID`](#heroku-eventssubscriptionsinfo-sub_name_or_id)
* [`heroku events:subscriptions:sfdc:create NAME`](#heroku-eventssubscriptionssfdccreate-name)

## `heroku events:authorizations`

lists Heroku Events authorizations

```
USAGE
  $ heroku events:authorizations -a <value> [-r <value>]

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use

DESCRIPTION
  lists Heroku Events authorizations
```

_See code: [dist/commands/events/authorizations/index.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/authorizations/index.ts)_

## `heroku heroku events:authorizations:destroy AUTH_ID -a <value> [-c <value>]`

destroys a Heroku Events authorization

```
USAGE
  $ heroku heroku events:authorizations:destroy AUTH_ID -a <value> [-c <value>]

ARGUMENTS
  AUTH_ID  Heroku Events authorization id

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>
  -r, --remote=<value>   git remote of app to use

DESCRIPTION
  destroys a Heroku Events authorization
```

_See code: [dist/commands/events/authorizations/destroy.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/authorizations/destroy.ts)_

## `heroku events:authorizations:info AUTH_ID`

shows info for a Heroku Events authorization

```
USAGE
  $ heroku events:authorizations:info [AUTH_ID] -a <value> [-r <value>]

ARGUMENTS
  AUTH_ID  Heroku Events authorization id

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use

DESCRIPTION
  shows info for a Heroku Events authorization
```

_See code: [dist/commands/events/authorizations/info.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/authorizations/info.ts)_

## `heroku events:authorizations:sfdc:create ORG_NAME`

creates a Salesforce Platform authorization for Heroku Events

```
USAGE
  $ heroku events:authorizations:sfdc:create [ORG_NAME] -a <value> [--browser <value>] [-r <value>]

ARGUMENTS
  ORG_NAME  Salesforce Org instance name

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use
  --browser=<value>     browser to open OAuth flow with (example: "firefox", "safari")

DESCRIPTION
  creates a Salesforce Platform authorization for Heroku Events
```

_See code: [dist/commands/events/authorizations/sfdc/create.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/authorizations/sfdc/create.ts)_

## `heroku events:generate NAME`

creates an event generator

```
USAGE
  $ heroku events:generate [NAME] -a <value> -i <value> -m <value> [-f <value> -t <value>] [-r <value>]

ARGUMENTS
  NAME  name to assign to the event generator

FLAGS
  -a, --app=<value>       (required) app to run command against
  -f, --filter=<value>    filter to apply when linking to target
  -i, --interval=<value>  (required) how often to trigger the event
  -m, --mapping=<value>   (required) the payload to be generated
  -r, --remote=<value>    git remote of app to use
  -t, --target=<value>    existing publication id or name to link to

DESCRIPTION
  creates an event generator

EXAMPLES
  # Create an event generator named "my-generator" that triggers every minute

    $ heroku events:generate my-generator -i "1m" -m "root = {this}" -a my-app
```

_See code: [dist/commands/events/generate.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/generate.ts)_

## `heroku events:publications`

lists Heroku Events publications

```
USAGE
  $ heroku events:publications -a <value> [-j] [-r <value>]

FLAGS
  -a, --app=<value>     (required) app to run command against
  -j, --json            output in json format
  -r, --remote=<value>  git remote of app to use

DESCRIPTION
  lists Heroku Events publications
```

_See code: [dist/commands/events/publications/index.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/publications/index.ts)_

## `heroku events:publications:datacloud:create NAME`

creates a Datacloud publication

```
USAGE
  $ heroku events:publications:datacloud:create [NAME] -a <value> -c <value> --object <value> -o <value> [-f <value> -s <value>] [-r
    <value>]

ARGUMENTS
  NAME  name to assign to the publication created

FLAGS
  -a, --app=<value>        (required) app to run command against
  -c, --connector=<value>  (required) ingest API Data Connector name
  -f, --filter=<value>     filter to apply when linking to source
  -o, --org-name=<value>   (required) authorized Salesforce Org instance name
  -r, --remote=<value>     git remote of app to use
  -s, --source=<value>     existing subscription name or id to link to
  --object=<value>         (required) object to publish to

DESCRIPTION
  creates a Datacloud publication

EXAMPLES
  # Create a Datacloud target ingesting …

    $ heroku events:publications:datacloud:create ordersDataTarget -c "SalesConnector" --object "Orders" -o "my-org"
```

_See code: [dist/commands/events/publications/datacloud/create.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/publications/datacloud/create.ts)_

## `heroku heroku events:publications:destroy PUB_NAME_OR_ID -a <value> [-c <value>]`

unlinks and destroys a Heroku Events publication

```
USAGE
  $ heroku heroku events:publications:destroy PUB_NAME_OR_ID -a <value> [-c <value>]

ARGUMENTS
  PUB_NAME_OR_ID  Heroku Events publication name or id

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>
  -r, --remote=<value>   git remote of app to use

DESCRIPTION
  unlinks and destroys a Heroku Events publication
```

_See code: [dist/commands/events/publications/destroy.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/publications/destroy.ts)_

## `heroku events:publications:info PUB_NAME_OR_ID`

shows info for a Heroku Events publication

```
USAGE
  $ heroku events:publications:info [PUB_NAME_OR_ID] -a <value> [-r <value>]

ARGUMENTS
  PUB_NAME_OR_ID  Heroku Events publication name or id

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use

DESCRIPTION
  shows info for a Heroku Events publication
```

_See code: [dist/commands/events/publications/info.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/publications/info.ts)_

## `heroku events:publications:sfdc:create NAME`

creates a Salesforce Platform publication

```
USAGE
  $ heroku events:publications:sfdc:create [NAME] -a <value> -e <value> -o <value> [-f <value> -s <value>] [-r <value>]

ARGUMENTS
  NAME  name to assign to the publication created

FLAGS
  -a, --app=<value>       (required) app to run command against
  -e, --event=<value>     (required) event to publish to
  -f, --filter=<value>    filter to apply when linking to source
  -o, --org-name=<value>  (required) authorized Salesforce Org instance name
  -r, --remote=<value>    git remote of app to use
  -s, --source=<value>    existing subscription name or id to link to

DESCRIPTION
  creates a Salesforce Platform publication

EXAMPLES
  # Create a Salesfore Platform event target that receives …

    $ heroku events:publications:sfdc:create systemStatus -e "/event/System_Status__e" -o my-org
```

_See code: [dist/commands/events/publications/sfdc/create.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/publications/sfdc/create.ts)_

## `heroku events:publications:webhook:create NAME`

creates a webhook publication

```
USAGE
  $ heroku events:publications:webhook:create [NAME] -a <value> -u <value> [-f <value> -s <value>] [-r <value>] [-t
  <value>]

ARGUMENTS
  NAME  name to assign to the publication created

FLAGS
  -a, --app=<value>     (required) app to run command against
  -f, --filter=<value>  filter to apply when linking to source
  -r, --remote=<value>  git remote of app to use
  -s, --source=<value>  existing subscription name or id to link to
  -t, --token=<value>   access token
  -u, --url=<value>     (required) webhook URL

DESCRIPTION
  creates a webhook publication

EXAMPLES
  # Create a Webhook URL target

    $ heroku events:publications:webhook:create opportunityChanged -u "https://my-app.herokuapp.com/webhooks" -a \
      my-app
```

_See code: [dist/commands/events/publications/webhook/create.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/publications/webhook/create.ts)_

## `heroku events:subscriptions`

lists Heroku Events subscriptions

```
USAGE
  $ heroku events:subscriptions -a <value> [-j] [-r <value>]

FLAGS
  -a, --app=<value>     (required) app to run command against
  -j, --json            output in json format
  -r, --remote=<value>  git remote of app to use

DESCRIPTION
  lists Heroku Events subscriptions
```

_See code: [dist/commands/events/subscriptions/index.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/subscriptions/index.ts)_

## `heroku heroku events:subscriptions:destroy SUB_NAME_OR_ID -a <value> [-c <value>]`

unlinks and destroys a Heroku Events subscription

```
USAGE
  $ heroku heroku events:subscriptions:destroy SUB_NAME_OR_ID -a <value> [-c <value>]

ARGUMENTS
  SUB_NAME_OR_ID  Heroku Events subscription name or id

FLAGS
  -a, --app=<value>      (required) app to run command against
  -c, --confirm=<value>
  -r, --remote=<value>   git remote of app to use

DESCRIPTION
  unlinks and destroys a Heroku Events subscription
```

_See code: [dist/commands/events/subscriptions/destroy.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/subscriptions/destroy.ts)_

## `heroku events:subscriptions:info SUB_NAME_OR_ID`

shows info for a Heroku Events subscription

```
USAGE
  $ heroku events:subscriptions:info [SUB_NAME_OR_ID] -a <value> [-r <value>]

ARGUMENTS
  SUB_NAME_OR_ID  Heroku Events subscription name or id

FLAGS
  -a, --app=<value>     (required) app to run command against
  -r, --remote=<value>  git remote of app to use

DESCRIPTION
  shows info for a Heroku Events subscription
```

_See code: [dist/commands/events/subscriptions/info.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/subscriptions/info.ts)_

## `heroku events:subscriptions:sfdc:create NAME`

creates a Salesforce Platform subscription

```
USAGE
  $ heroku events:subscriptions:sfdc:create [NAME] -a <value> -e <value> -o <value> [-f <value> -t <value>] [-r <value>]

ARGUMENTS
  NAME  name to assign to the subscription created

FLAGS
  -a, --app=<value>       (required) app to run command against
  -e, --event=<value>     (required) event to publish to
  -f, --filter=<value>    filter to apply when linking to source
  -o, --org-name=<value>  (required) authorized Salesforce Org instance name
  -r, --remote=<value>    git remote of app to use
  -t, --target=<value>    existing publication name or id to link to

DESCRIPTION
  creates a Salesforce Platform subscription

EXAMPLES
  # Create a Salesfore Platform subscription for Account Change events from 'my-org'.

    $ heroku events:subscriptions:sfdc:create accountChange -e "/data/AccountChange" -o my-org
```

_See code: [dist/commands/events/subscriptions/sfdc/create.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/dist/commands/events/subscriptions/sfdc/create.ts)_
<!-- commandsstop -->
