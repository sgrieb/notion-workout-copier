
# Notion Automation

## Overview
A configuration based nodejs application which will automate creation of Notion documents, along with various manipulations of the documents upon creation.

## Features
- Weekly Document Creation - Most recently created document in the list used as template
- Date and Document count based naming support
- Automated unchecking of columns on document creation
- Support for select type columns

## Not Yet Supported
- Document Creation in folders with 100+ items
- Document archiving

## Running Locally
- `npm install`
- copy `env.example` to `.env`
- replace `NOTION_TOKEN` with your Notion API token
- `npm run local` OR Debug with VSCode Launch Configuration

## Configuration Options
See `event.sample.json` for config structure.  `config` property should always be an array.

- (Required) `parent` - The id of the notion page which contains your child databases to be copied
- (Required) `title` - The title to be applied to the created document
  - Title creation supports the following dynamic tokens for replacement:
  - `[PAGE_COUNT]` - The number of pages within the list of documents
  - `[DATE]` - The date that the document is created in mm/dd format
- `sortBy` - The column name to sort by (descending)
- `selectColumns` - An Array of strings, where the strings are the column names of any Select type columns (these must be explicitly handled differently)
- `uncheckColumns` - An array of column names to uncheck

## Use Cases
### A Mildly Complex Scenario - Workout Copier
- Every Monday morning, copy the most recently created workout page
- Rename it to Week [N] - [current_date]
- Uncheck all done boxes
- Includes a Select style Column