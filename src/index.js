require('dotenv').config();

const CopyEvent = require('./CopyEvent');
const CopyConfig = require('./CopyConfig');
const Logger = require('./Logger');
const Copy = require('./Copy');

async function main(event) {
  const logger = new Logger(console);

  try {
    // validate the incoming event (an array of configs)
    CopyEvent.validate(event);

    for (const config of event.config) {
      // validate the config
      CopyConfig.validate(config);

      // execute our copy
      const copy = new Copy(config, logger);
      await copy.createArchive();
      await copy.updateCurrent();
    }

    logger.log('Copy Complete!');
  } catch (e) {
    logger.error(`Caught Error: ${JSON.stringify(e)}`);
  }
}

exports.handler = async (event, context) => {
  await main(event, context);
};
