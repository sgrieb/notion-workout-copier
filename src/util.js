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

module.exports = {
  buildName,
};
