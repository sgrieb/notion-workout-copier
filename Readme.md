
# Notion Automation

## Overview
A configuration based nodejs application which will automate creation of Notion documents, along with various manipulations of the documents upon creation.

## Features
- Weekly Document Creation
- Date and Document count based naming support
- Automated unchecking of columns on document creation

## Not Yet Supported
- Document Creation in folders with 100+ items
- Document archiving

## Running Locally
- `npm install`
- copy `env.example` to `.env`
- replace `NOTION_TOKEN` with your Notion API token
- `npm run local` OR Debug with VSCode Launch Configuration


## Use Cases
### A Mildly Complex Scenario - Workout Copier
- Every Monday morning, copy the most recently created workout page
- Rename it to Week [N] - [current_date]
- Uncheck all done boxes