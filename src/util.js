function buildName(config, pageCount) {
  const today = new Date();
  let dateString = today.toLocaleDateString('en-US');
  dateString = dateString.substring(0, dateString.length - 5);

  let { title } = config;

  // apply string replacements
  title = title.replace('[PAGE_COUNT]', pageCount);
  title = title.replace('[DATE]', dateString);

  return title;
}

function getBaseDb(childBlocks) {
  let base = null;

  // sort based on creation date
  childBlocks.results.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));

  childBlocks.results.forEach((item) => {
    if (base) {
      return;
    }

    if (item.type === 'child_database') {
      base = item;
    }
  });

  // get the most recently created db
  return base;
}

module.exports = {
  getBaseDb,
  buildName,
};
