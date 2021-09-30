
require('dotenv').config()

const { Client } = require("@notionhq/client")

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

function buildName() {
  return "Workout"
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
                "content": buildName(),
                "link": null
            }
        }
      ],
      "properties": dbSchema.properties
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

      console.log(`adding row ${row}`)
      row++
      
      const result = await notion.pages.create(createPayload)
      // console.log(`result is: ${JSON.stringify(result)}`)
    }

    console.log("Done!")
}

main();

// Difficulty.id