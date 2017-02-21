'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const uniq = require('lodash.uniq')

function * diff (context, heroku) {
  const ourApp = context.app
  const otherApp = context.args.OTHER_APP

  let [ ourFormation, otherFormation ] = [
    yield heroku.get(`/apps/${ourApp}/dynos`),
    yield heroku.get(`/apps/${otherApp}/dynos`)
  ]

  let countDynos = (accum, next) => {
    if (!(next.type in accum)) {
      accum[next.type] = {}
    }
    let counts = accum[next.type]
    let curr = counts[next.size] || 0
    counts[next.size] = curr + 1
    return accum
  }

  let ourDynoCounts = ourFormation.reduce(countDynos, {})
  let otherDynoCounts = otherFormation.reduce(countDynos, {})

  let allTypes = uniq(Object.keys(ourDynoCounts).concat(Object.keys(otherDynoCounts)))

  cli.table(allTypes.sort().map((type) => {
    let ourCounts = ourDynoCounts[type]
    let ours = ourCounts && Object.keys(ourCounts).sort()
                                  .map((size) => `${ourCounts[size]}:${size}`)
                                  .join(',')

    let otherCounts = otherDynoCounts[type]
    let other = otherCounts && Object.keys(otherCounts).sort()
                                     .map((size) => `${otherCounts[size]}:${size}`)
                                     .join(',')

    if (ours && !other) {
      other = cli.color.red('--')
    } else if (!ours && other) {
      ours = cli.color.red('--')
    }

    return {type: type, ours: ours, other: other}
  }), {
    columns: [
      {key: 'type', label: 'Process Type'},
      {key: 'ours', label: `In ${ourApp}`},
      {key: 'other', label: `In ${otherApp}`}
    ]
  })
}

module.exports = {
  topic: 'ps',
  command: 'diff',
  description: 'compare dyno formations across two apps',
  args: [
    { name: 'OTHER_APP', optional: false }
  ],
  help: `
ps:diff app

Compare differences in dyno formation between current app
  and another app specified as the argument.

Example:

$ heroku ps:diff sushi --app sushi-staging

Process Type  In sushi-staging  In sushi
────────────  ────────────────  ─────────────
web           1:PX              5:Private-L
worker        1:1X              5:Private-M
  `,

  needsAuth: true,
  needsApp: true,

  run: cli.command(co.wrap(diff))
}
