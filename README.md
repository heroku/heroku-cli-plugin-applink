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
* [`heroku events:authorizations:info AUTH_ID`](#heroku-eventsauthorizationsinfo-auth_id)

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
<!-- commandsstop -->
