const { buildName, getBaseDb } = require('./util');

describe('buildName', () => {
  it('replaces all tokens', () => {
    buildName({ title: 'something' }, 3);
    // TODO: add assertions
  });
});

describe('getBaseDb', () => {
  it('gets the most recently created child db', () => {
    getBaseDb({ results: [] });
    // TODO: add assertions
  });
});
