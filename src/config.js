const { Client } = require('@notionhq/client');

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

function buildName(config, pageCount) {
  const today = new Date();
  let dateString = today.toLocaleDateString('en-US');
  dateString = dateString.substring(0, dateString.length - 5);

  let { title } = config;

  // apply string replacements
  title = title.replace('[PAGE_COUNT]', pageCount);
  title = title.replace('[DATE]', dateString);

  return title;
}

function getBaseDb(childBlocks) {
  let base = null;

  // sort based on creation date
  childBlocks.results.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));

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

async function buildContents(config, dbCreateResult, contentPages) {
  // we have to map the selects to the ones on the new page
  const selectOptions = dbCreateResult.properties.Difficulty.select.options;
  const options = {};
  if (config.selectColumns) {
    config.selectColumns.forEach((column) => {
      options[column] = dbCreateResult.properties[column].select.options;
    });
  }

  let row = 1;

  // add the contents
  for (const page of contentPages) {
    const createPayload = Object.assign(page, {
      parent: {
        database_id: dbCreateResult.id,
      },
    });

    if (config.selectColumns) {
      config.selectColumns.forEach((column) => {
        if (page.properties[column].select) {
          createPayload.properties[column].select = selectOptions.find(
            (s) => s.name === page.properties[column].select.name,
          );
        }
      });
    }

    // checkbox handling
    if (config.uncheckColumns) {
      config.uncheckColumns.forEach((column) => {
        page.properties[column].checkbox = false;
      });
    }

    console.log(`adding row ${row}`);
    row++;

    await notion.pages.create(createPayload);
  }
}

async function run(config) {
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

  await buildContents(config, dbCreateResult, contentPages);
}

module.exports = {
  run,
};
