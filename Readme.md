# heroku-ps-diff

A heroku plugin to display differences between process formations of two apps

This can be useful to, e.g., bring an atrophied staging environment up
to date.

### Usage

Simple output for quick comparisons:

```console
$ heroku ps:diff sushi -a sushi-staging
Process Type         In sushi-staging  In sushi
───────────────────  ────────────────  ────────────
web                  1:Private-S       4:Private-M
worker               1:Private-S       2:Private-M
clock                --                1:Private-M
```

### Installation

```bash
$ heroku plugins:install heroku-ps-diff
```

#### Update

```bash
$ heroku update
```

## THIS IS BETA SOFTWARE

Thanks for trying it out. If you find any problems, please report an
issue and include your Heroku toolbelt version and your OS version.
