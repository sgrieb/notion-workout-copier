const Notion = require('./Notion');
const { buildName } = require('./util');

class Copy {
  constructor(config, logger) {
    this.config = config;
    this.notion = new Notion();
    this.logger = logger;
  }

  async createArchive() {
    // get current doc contents
    const currentDocContents = await this.notion.getDbContents(
      this.config.documentId,
      this.config.sortBy,
    );

    // build archive page name
    const childCount = await this.notion.getChildCount(this.config.parent);
    const dbName = buildName(this.config, childCount);

    // create the db
    const oldDbSchema = await this.notion.getDbSchema(this.config.documentId);
    const newDb = await this.notion.createDb(
      this.config.parent,
      oldDbSchema.properties,
      dbName,
    );

    // create the page
    await this.buildContents(currentDocContents, newDb);
  }

  async updateCurrent() {
    let currentDocContents = await this.notion.getDbContents(
      this.config.documentId,
      this.config.sortBy,
    );

    currentDocContents = this.sortByColumn(
      currentDocContents,
      this.config.sortBy,
    );

    // update each row
    for (const page of currentDocContents) {
      this.uncheckColumns(page);
      this.logger.log('Updating row');
      await this.notion.updatePage(page.id, page);
    }
  }

  async buildContents(rows, newDb) {
    // handle select-style columns
    const selectOptions = this.getSelectOptions(newDb);

    let rowIndex = 1;
    // build the rows
    for (const oldRow of rows) {
      const newRow = Object.assign(oldRow, {
        parent: {
          database_id: newDb.id,
        },
      });

      if (this.config.selectColumns) {
        this.applySelectOptions(oldRow, newRow, selectOptions);
      }

      this.logger.log(`adding row ${rowIndex}`);
      rowIndex++;

      await this.notion.createPage(newRow);
    }
  }

  sortByColumn(pages, column) {
    return pages.sort((a, b) => b.properties[column].number - a.properties[column].number);
  }

  getSelectOptions(newDb) {
    const options = {};
    if (this.config.selectColumns) {
      this.config.selectColumns.forEach((column) => {
        options[column] = newDb.properties[column].select.options;
      });
    }

    return options;
  }

  applySelectOptions(oldRow, newRow, selectOptions) {
    this.config.selectColumns.forEach((column) => {
      // we have to map the selects to the ones on the new row
      const columnOptions = selectOptions[column];

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
