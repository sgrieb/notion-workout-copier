const validate = (config) => {
  if (!config.parent) {
    throw new Error('Config: \'parent\' value must be provided');
  }
};

module.exports = {
  validate,
};
