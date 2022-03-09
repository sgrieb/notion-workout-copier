
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

const pages = {
    create: jest.fn(),
}

const clientMethods = {
    blocks,
    databases,
    pages,
}

const Client = jest.fn().mockImplementation(() => {
  return clientMethods
});

module.exports = {
    ...clientMethods,
    Client,
}