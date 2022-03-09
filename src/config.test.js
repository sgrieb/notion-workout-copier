const notion = require('@notionhq/client');

const util = require('./util');

jest.mock('./util', () => ({
  buildName: jest.fn(),
  getBaseDb: jest.fn(),
}));

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
      const childBlocks = { results: [] };
      const dbSchema = {};
      const contentResults = { results: [] };
      const dbCreateResult = { properties: {} };

      notion.blocks.children.list.mockReturnValue(childBlocks);
      notion.databases.retrieve.mockReturnValue(dbSchema);
      notion.databases.query.mockReturnValue(contentResults);
      notion.databases.create.mockReturnValue(dbCreateResult);

      util.getBaseDb.mockReturnValue({ id: 'base-id' });

      await config.run({
        parent: 'parent-id',
      });

      expect(notion.blocks.children.list).toHaveBeenCalledWith({ block_id: 'parent-id' });
    });
  });
});
