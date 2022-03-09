const config = require('./config');

jest.mock('./config', () => ({
  run: jest.fn(),
}));

const { handler } = require('./index');

describe('event handler', () => {
  describe('with a null event', () => {
    it('exits and logs msg', async () => {
      await handler();
      expect(console.log).toHaveBeenCalledWith('Invalid / No config provided.  Exiting.');
    });
  });

  describe('without a config', () => {
    it('exits and logs msg', async () => {
      await handler({});
      expect(console.log).toHaveBeenCalledWith('Invalid / No config provided.  Exiting.');
    });
  });

  describe('with a valid config', () => {
    it('calls run config for each config and logs complete', async () => {
      await (handler({
        config: [
          'one', 'two',
        ],
      }));

      expect(config.run).toHaveBeenNthCalledWith(1, 'one');
      expect(config.run).toHaveBeenNthCalledWith(2, 'two');

      expect(console.log).toHaveBeenCalledWith('Done!');
    });
  });
});
