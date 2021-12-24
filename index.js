
require('dotenv').config()

const { Client } = require("@notionhq/client")

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

function buildName(pageCount) {
  var today  = new Date();
  let dateString = today.toLocaleDateString("en-US")
  dateString = dateString.substring(0, dateString.length - 5)

  return `Week ${pageCount} - ${dateString}`
}

async function main() {

    // fetch the most recently created as a base
    // this will only work up  to 100, so archive at 100
    // these are naturally in the right order so just grab the last one
    const childBlocks = await notion.blocks.children.list({
      block_id: process.env.PARENT_PAGE_ID,
    })

    // get our base db
    let baseDb = childBlocks.results[childBlocks.results.length - 1]

    // get base schema
    const dbSchema = await notion.databases.retrieve({
      database_id: baseDb.id,
    })

    // get contents
    let contentPages = []
    let cursor = undefined
    while (true) {
      const { results, next_cursor } = await notion.databases.query({
        database_id: baseDb.id,
        start_cursor: cursor,
        sorts: [
          {
            property: 'Order',
            direction: 'descending',
          },
        ]
      })

      contentPages.push(...results)
      if (!next_cursor) {
        break
      }
      cursor = next_cursor
    }

    // remove first item which is a blank row for some reason?
    contentPages.splice(contentPages.length - 1, 1)

    // USE THIS LATER FOR OVER 100 pages
    // get parent page contents (for calculating workout number)
    let pageCount = childBlocks.results.length
    // cursor = undefined
    // while (true) {
    //   const { results, next_cursor } = await notion.blocks.children.list({
    //     block_id: baseDb.id,
    //     start_cursor: cursor,
    //     sorts: [
    //       {
    //         property: 'Order',
    //         direction: 'descending',
    //       },
    //     ]
    //   })

    //   pageCount += results.length
    //   if (!next_cursor) {
    //     break
    //   }
    //   cursor = next_cursor
    // }

    // create the db
    const dbCreateResult = await notion.databases.create({
      "parent": {
          "type": "page_id",
          "page_id": process.env.PARENT_PAGE_ID
      },
      "title": [
        {
            "type": "text",
            "text": {
                "content": buildName(pageCount),
                "link": null
            }
        }
      ],
      properties: dbSchema.properties,
    })

    // ffs we have to map the selects to the ones on the new page
    const selectOptions = dbCreateResult.properties["Difficulty"].select.options

    let row = 1

    // add the contents
    for (const page of contentPages) {
      const createPayload = Object.assign(page, {
        parent: {
          database_id: dbCreateResult.id,
        },
      });

      if(page.properties["Difficulty"].select) {
        createPayload.properties.Difficulty.select = selectOptions.find((s) => s.name === page.properties["Difficulty"].select.name)
      }

      // set checkboxes to unselected
      page.properties["Done?"].checkbox =  false

      console.log(`adding row ${row}`)
      row++

      await notion.pages.create(createPayload)
    }

    console.log("Done!")
}

exports.handler = async (event, context) => {
  await main();
};
