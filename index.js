const { main } = require("./src/index")

exports.handler = async (event, context) => {
  await main(event);
};
