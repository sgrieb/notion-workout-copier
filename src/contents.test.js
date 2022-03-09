

const { Client } = require('@notionhq/client');

const { build } = require('./contents')

describe('build', () => {
    describe('with valid params', () => {
        it.only('creates a page', async () => {
            const config = {
                uncheckColumns: [
                    'Difficulty'
                ],
                selectColumns: [
                    'Done'
                ]
            }
            const contentPage = { properties: { 'Done': { select: { options: [] } }, 'Difficulty': { checkbox: {} } } }
            const dbCreateResult = { ...contentPage }
            const contentPages = [{ ...contentPage }]

            const notion = new Client();

            await build(notion, config, dbCreateResult, contentPages)
        })
    })
})