// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient
const debug = require('debug')('todo:CosmosClientDAO')
const CustomError = require('../public/errors/customError')

// For simplicity we'll set a constant partition key
// reference: https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/tutorial-nodejs-web-app
const partitionKey = undefined
class CosmosClientDAO {
    /**
     * Manages reading, adding, and updating Tasks in Azure Cosmos DB
     * @param {CosmosClient} cosmosClient
     * @param {string} databaseId
     */
    constructor(cosmosClient, databaseId) {
        this.client = cosmosClient
        this.databaseId = databaseId

        this.database = this.client.database(databaseId);
        this.sessionToken = undefined;
    }

    async init() {
        debug('Setting up the database...')
        const dbResponse = await this.client.databases.createIfNotExists({
            id: this.databaseId
        })
        this.database = dbResponse.database
    }

    async methodWithRetry(fn) {
        const maxRetries = 30;
        let retryCount = 0;
        let delay = 1000; // initial delay in ms

        while (true) {
            try {
                return await fn();
            } catch (error) {
                console.error(error);
                if (++retryCount === maxRetries || error.code !== 429) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // double the delay for the next retry
            }
        }
    }

    async find(containerId, querySpec) {
        return this.methodWithRetry(async () => {
            debug('Querying for items from the database');
            const container = this.database.container(containerId);
            if (!container) {
                throw new CustomError('Collection is not initialized.');
            }
            const feedOptions = {
                accessCondition: { type: 'IfMatch', condition: this.sessionToken }, // Include session token in request options
            };
            const { resources: doc, diagnostics: diagnostics } = await container.items.query(querySpec, feedOptions).fetchAll();
            diagnostics.clientConfig?.defaultHeaders['x-ms-session-token'] && (this.sessionToken = diagnostics.clientConfig.defaultHeaders['x-ms-session-token']);
            return doc;
        });
    }

    async addItem(containerId, item) {
        return this.methodWithRetry(async () => {

            const container = this.database.container(containerId);

            if (!container) {
                throw new CustomError('Collection is not initialized.');
            }
            const requestOptions = {
                accessCondition: { type: 'IfMatch', condition: this.sessionToken }, // Include session token in request options
                //consistencyLevel: 'Strong' // Use "Strong" consistency, Strong Consistency guarantees that read operations always return the value that was last written.
            };
            const { resource: doc, headers: headers } = await container.items.create(item, requestOptions);
            this.sessionToken = headers['x-ms-session-token'];

            console.log('Session token:', this.sessionToken);
            return doc;
        });
    }

    async updateItem(containerId, item, partitionKey) {
        return this.methodWithRetry(async () => {
            const container = this.database.container(containerId);
            if (!container) {
                throw new CustomError('Collection is not initialized.');
            }
            // @ts-ignore
            const { resource: replaced, headers: headers } = await container.item(item.id, partitionKey).replace(item);
            this.sessionToken = headers['x-ms-session-token'];

            return replaced;
        });
    }

    async getItem(containerId, itemId) {
        return this.methodWithRetry(async () => {
            debug('Getting an item from the database');
            const container = this.database.container(containerId);
            if (!container) {
                throw new CustomError('Collection is not initialized.');
            }
            // @ts-ignore
            const { resource } = await container.item(itemId, partitionKey).read();
            return resource;
        });
    }


    async deleteItem(containerId, itemId, partitionKey) {
        return this.methodWithRetry(async () => {
            debug('Getting an item from the database');
            const container = this.database.container(containerId);
            if (!container) {
                throw new CustomError('Collection is not initialized.');
            }
            // @ts-ignore
            const { resource: deletedDoc, headers: headers } = await container.item(itemId, partitionKey).delete();
            this.sessionToken = headers['x-ms-session-token'];

            return deletedDoc;
        });
    }
}

module.exports = CosmosClientDAO