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

_See code: [src/commands/events/authorizations/index.ts](https://github.com/heroku/heroku-cli-plugin-events/blob/v0.0.1/src/commands/events/authorizations/index.ts)_
<!-- commandsstop -->
