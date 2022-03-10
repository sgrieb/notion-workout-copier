const validate = (event) => {
  if (!event) {
    throw new Error('Undefined or null event provided');
  }

  if (!event.config) {
    throw new Error('Please provide \'config\' property in event root.');
  }
};

module.exports = {
  validate,
};
