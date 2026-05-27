import nock from 'nock';

process.env.CI = '1';
process.env.HEROKU_API_KEY = 'test-api-key';
process.stdout.columns = 120;
process.stderr.columns = 120;
nock.disableNetConnect();
