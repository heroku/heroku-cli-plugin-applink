import nock from 'nock'

process.stdout.columns = 120                    // Set screen width for consistent wrapping
process.stderr.columns = 120                    // Set screen width for consistent wrapping

nock.disableNetConnect()
