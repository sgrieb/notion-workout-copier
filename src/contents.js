async function build(notion, config, dbCreateResult, contentPages) {
  const options = {};
  if (config.selectColumns) {
    config.selectColumns.forEach((column) => {
      options[column] = dbCreateResult.properties[column].select.options;
    });
  }

  let row = 1;

  // add the contents
  for (const page of contentPages) {
    const createPayload = Object.assign(page, {
      parent: {
        database_id: dbCreateResult.id,
      },
    });

    if (config.selectColumns) {
      config.selectColumns.forEach((column) => {
        // we have to map the selects to the ones on the new page
        const selectOptions = page.properties[column].select.options;

        if (page.properties[column].select) {
          createPayload.properties[column].select = selectOptions.find(
            (s) => s.name === page.properties[column].select.name,
          );
        }
      });
    }

    // checkbox handling
    if (config.uncheckColumns) {
      config.uncheckColumns.forEach((column) => {
        page.properties[column].checkbox = false;
      });
    }

    console.log(`adding row ${row}`);
    row++;

    await notion.pages.create(createPayload);
  }
}

module.exports = {
  build,
};
