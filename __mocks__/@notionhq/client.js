
const blocks = {
    children: {
        list: jest.fn()
    }
}
const Client = jest.fn().mockImplementation(() => {
  return {
    blocks
    };
});


module.exports = {
    blocks,
    Client,
}