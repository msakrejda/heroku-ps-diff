'use strict'

const expect = require('chai').expect
const mocha = require('mocha')
const describe = mocha.describe
const it = mocha.it
const beforeEach = mocha.beforeEach
const afterEach = mocha.afterEach

const cli = require('heroku-cli-util')
const nock = require('nock')

const cmd = require('../../commands/diff')

describe('ps:diff', () => {
  let heroku

  beforeEach(() => {
    cli.mockConsole()
    cli.exit.mock()
    heroku = nock('https://api.heroku.com')
  })

  afterEach(() => {
    heroku.done()
    nock.cleanAll()
  })

  it('displays the difference between the two app environments', () => {
    heroku.get('/apps/sushi/dynos')
          .reply(200, [
            { type: 'web', size: 'Private-S' },
            { type: 'web', size: 'Private-S' },
            { type: 'worker', size: 'Private-M' },
            { type: 'clock', size: 'Private-M' }
          ])
    heroku.get('/apps/sushi-staging/dynos')
          .reply(200, [
            { type: 'web', size: 'Private-S' },
            { type: 'worker', size: 'Private-S' }
          ])

    return cmd.run({app: 'sushi-staging', args: {OTHER_APP: 'sushi'}, flags: {}})
              .then(() => {
                expect(cli.stdout).to.equal(`Process Type  In sushi-staging  In sushi
────────────  ────────────────  ───────────
clock         --                1:Private-M
web           1:Private-S       2:Private-S
worker        1:Private-S       1:Private-M
`)
                expect(cli.stderr).to.be.empty
              })
  })
})
