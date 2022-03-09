require('dotenv').config();

const { run } = require('./config');

async function main(event) {
  if (!event || !event.config) {
    console.log('Invalid / No config provided.  Exiting.');
    return;
  }

  for (const config of event.config) {
    await run(config);
  }

  console.log('Done!');
}

exports.handler = async (event, context) => {
  await main(event, context);
};
