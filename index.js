
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

  return `Workout ${pageCount} - ${dateString}`
}

async function main() {
    // get base schema
    const dbSchema = await notion.databases.retrieve({
      database_id: process.env.BASE_DB_ID,
    })

    // get contents
    const contentPages = []
    let cursor = undefined
    while (true) {
      const { results, next_cursor } = await notion.databases.query({
        database_id: process.env.BASE_DB_ID,
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

    // get parent page contents (for calculating workout number)
    let pageCount = 0
    cursor = undefined
    while (true) {
      const { results, next_cursor } = await notion.blocks.children.list({
        block_id: process.env.PARENT_PAGE_ID,
        start_cursor: cursor,
        sorts: [
          {
            property: 'Order',
            direction: 'descending',
          },
        ]
      })

      pageCount += results.length
      if (!next_cursor) {
        break
      }
      cursor = next_cursor
    }

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

main();
