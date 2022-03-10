const { Client } = require('@notionhq/client');

class Notion {
  constructor() {
    this.client = new Client({
      auth: process.env.NOTION_TOKEN,
    });
  }

  async getChildCount(parentId) {
    const childBlocks = await this.client.blocks.children.list({
      block_id: parentId,
    });
    return childBlocks.results.length;
  }

  async getMostRecentChild(parentId) {
    // TODO: this will only work up  to 100
    const childBlocks = await this.client.blocks.children.list({
      block_id: parentId,
    });

    let base = null;

    // sort based on creation date
    childBlocks.results.sort(
      (a, b) => new Date(b.created_time) - new Date(a.created_time),
    );

    childBlocks.results.forEach((item) => {
      if (base) {
        return;
      }

      if (item.type === 'child_database') {
        base = item;
      }
    });

    // get the most recently created db
    return base;
  }

  async getDbContents(dbId, config) {
    const contentPages = [];
    let cursor;

    while (true) {
      const query = {
        database_id: dbId,
        start_cursor: cursor,
      };

      // apply sort if necessary
      if (config.sortBy) {
        query.sorts = [
          {
            property: config.sortBy,
            direction: 'descending',
          },
        ];
      }

      const { results, next_cursor } = await this.client.databases.query(query);
      contentPages.push(...results);
      if (!next_cursor) {
        break;
      }
      cursor = next_cursor;
    }
    return contentPages;
  }

  async getDbSchema(dbId) {
    return this.client.databases.retrieve({
      database_id: dbId,
    });
  }

  async createDb(parentId, dbProperties, name) {
    try {
      return await this.client.databases.create({
        parent: {
          type: 'page_id',
          page_id: parentId,
        },
        title: [
          {
            type: 'text',
            text: {
              content: name,
              link: null,
            },
          },
        ],
        properties: dbProperties,
      });
    } catch (e) {
      return e;
    }
  }

  async createPage(page) {
    try {
      return this.client.pages.create(page);
    } catch (e) {
      return e;
    }
  }
}

module.exports = Notion;
