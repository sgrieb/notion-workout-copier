
const blocks = {
    children: {
        list: jest.fn()
    }
}

const databases = {
    retrieve: jest.fn(),
    query: jest.fn(),
    create: jest.fn(),
}

const clientMethods = {
    blocks,
    databases,
}

const Client = jest.fn().mockImplementation(() => {
  return clientMethods
});

module.exports = {
    ...clientMethods,
    Client,
}