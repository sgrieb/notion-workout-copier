
require('dotenv').config()

const { Client } = require("@notionhq/client")

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function main() {
    console.log(process.env.NOTION_TOKEN)

    const listUsersResponse = await notion.users.list()
    console.log(listUsersResponse)
}

main();