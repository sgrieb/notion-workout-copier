const notion = require('@notionhq/client');
const config = require('./config');

describe('run config', () => {
  describe('without a config.parent', () => {
    it('logs a problem and exits', async () => {
      await config.run({});

      expect(console.log).toHaveBeenCalledWith('parent value must be provided');
    });
  });

  describe('with a valid config', () => {
    it('performs a copy', async () => {
      notion.blocks.children.list.mockReturnValue([]);

      await config.run({
        parent: '1234',
      });
      expect(notion.blocks.children.list).toHaveBeenCalledWith({});
    });
  });
});
