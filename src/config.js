const { Client } = require('@notionhq/client');

const { getBaseDb, buildName } = require('./util');
const { build } = require('./contents');

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function run(config) {
  if (!config.parent) {
    console.log('parent value must be provided');
    return;
  }

  // fetch the most recently created as a base
  // this will only work up  to 100
  const childBlocks = await notion.blocks.children.list({
    block_id: config.parent,
  });

  // get our base db
  const baseDb = getBaseDb(childBlocks);

  if (!baseDb) {
    console.log('Unable to get baseDB.  Exiting.');
    return;
  }

  // get base schema
  const dbSchema = await notion.databases.retrieve({
    database_id: baseDb.id,
  });

  // get contents
  const contentPages = [];
  let cursor;
  while (true) {
    const query = {
      database_id: baseDb.id,
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

    const { results, next_cursor } = await notion.databases.query(query);
    contentPages.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }

  // remove first item which is a blank row for some reason?
  // contentPages.splice(contentPages.length - 1, 1)

  // get parent page contents (for calculating workout number)
  const pageCount = childBlocks.results.length;

  // create the db
  const dbCreateResult = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: config.parent,
    },
    title: [
      {
        type: 'text',
        text: {
          content: buildName(config, pageCount),
          link: null,
        },
      },
    ],
    properties: dbSchema.properties,
  });

  await build(notion, config, dbCreateResult, contentPages);
}

module.exports = {
  run,
};
