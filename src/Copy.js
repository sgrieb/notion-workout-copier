const Notion = require('./Notion');
const { buildName } = require('./util');

class Copy {
  constructor(config, logger) {
    this.config = config;
    this.notion = new Notion();
    this.logger = logger
  }

  async execute() {
    // db === table in notion-land
    // page === ...everything else

    // get some stuff
    const mostRecent = await this.notion.getMostRecentChild(this.config.parent);
    const mostRecentContents = await this.notion.getDbContents(
      mostRecent.id,
      this.config,
    );

    // build page name
    const childCount = await this.notion.getChildCount(this.config.parent);
    const dbName = buildName(this.config, childCount);

    // create the db
    const newDbSchema = await this.notion.getDbSchema(mostRecent.id);
    const newDb = await this.notion.createDb(this.config.parent, newDbSchema.properties, dbName);

    // create the page
    await this.buildContents(mostRecentContents, newDb);
  }

  async buildContents(rows, newDb) {
    // handle select-style columns
    const selectOptions = this.getSelectOptions(newDb)

    let rowIndex = 1;
    // build the rows
    for (const oldRow of rows) {
      const newRow = Object.assign(oldRow, {
        parent: {
          database_id: newDb.id,
        },
      });

      if (this.config.selectColumns) {
        this.applySelectOptions(oldRow, newRow, selectOptions)
      }

      // checkbox handling
      if (this.config.uncheckColumns) {
        this.uncheckColumns(newRow)
      }

      this.logger.log(`adding row ${rowIndex}`);
      rowIndex++;

      await this.notion.createPage(newRow);
    }
  }

  getSelectOptions(newDb) {
    const options = {};
    if (this.config.selectColumns) {
      this.config.selectColumns.forEach((column) => {
        options[column] = newDb.properties[column].select.options;
      });
    }

    return options
  }

  applySelectOptions(oldRow, newRow, selectOptions) {
    this.config.selectColumns.forEach((column) => {
      // we have to map the selects to the ones on the new row
      const columnOptions = selectOptions[column]

      if (oldRow.properties[column].select) {
        newRow.properties[column].select = columnOptions.find(
          (s) => s.name === oldRow.properties[column].select.name,
        );
      }
    });
  }

  uncheckColumns(newRow) {
    this.config.uncheckColumns.forEach((column) => {
      newRow.properties[column].checkbox = false;
    });
  }
}

module.exports = Copy;
