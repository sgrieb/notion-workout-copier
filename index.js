
require('dotenv').config()

const { Client } = require("@notionhq/client")

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function main() {

    // get base schema
    const dbSchema = await notion.databases.retrieve({
      database_id: process.env.BASE_DB_ID,
    })

    // get contents
    // const pages = []
    // let cursor = undefined
    // while (true) {
    //   const { results, next_cursor } = await notion.databases.query({
    //     database_id: BASE_DB_ID,
    //     start_cursor: cursor,
    //   })

    //   pages.push(...results)
    //   if (!next_cursor) {
    //     break
    //   }
    //   cursor = next_cursor
    // }

    const result = await notion.databases.create({
      "parent": {
          "type": "page_id",
          "page_id": process.env.PARENT_PAGE_ID
      },
      "title": [
        {
            "type": "text",
            "text": {
                "content": "Workout",
                "link": null
            }
        }
      ],
      "properties": dbSchema.properties
    })

    console.log(`result is: ${JSON.stringify(result)}`)
}

main();
