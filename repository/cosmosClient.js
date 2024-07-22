const ConfigMaps = require("../config/configMaps");
const CosmosClient = require("@azure/cosmos").CosmosClient;
const KeyVaultClient = require("./keyVaultClient");
const Utils = require("./../public/utils.js");
let cosmosClient;

exports.createCosmosClient = async () => {
    try {
        if (typeof cosmosClient === 'object') {
            if (await tryConnect(cosmosClient)) {
                return cosmosClient;
            }
        }

        await Utils.Logger("cosmosClient.createCosmosClient", Utils.LogLevel.Debug, "The available CosmosClient is not existing. Will create a new one.");
        let secretName = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.CosmosDBKeyFile : ConfigMaps.DefaultValues.CosmosDBSecret;
        let key = await KeyVaultClient.GetKey(secretName);
        let [ClientCanConnect, Client] = await createClient(key);
        if (!ClientCanConnect) {
            throw "CosmosClient connection failed.";
        }
        await Utils.Logger("cosmosClient.createCosmosClient", Utils.LogLevel.Debug, "CosmosDBClient connected successfully.");

        return Client;
    } catch (e) {
        await Utils.Logger("cosmosClient.createCosmosClient", Utils.LogLevel.Error, `CosmosClient creation failed: ${e.message}`);

        return null;
    }
};

async function createClient(key) {
    const useMultipleWriteLocations = process.env.MULTIWRITELOC ?? true;
    const preferredLocationsStr = process.env.PREFREGION;
    const preferredLocations = typeof (preferredLocationsStr) === "undefined"
        ? []
        : preferredLocationsStr.split(',');    
    const connectionPolicy = {
        useMultipleWriteLocations: useMultipleWriteLocations,
        preferredLocations: preferredLocations
    }
    cosmosClient = new CosmosClient({
        endpoint: process.env.COSMOS_HOST || ConfigMaps.DefaultValues.CosmosDBEndpoint,
        key: key,
        connectionPolicy: connectionPolicy
    });
    await Utils.Logger("cosmosClient.createClient", Utils.LogLevel.Debug, `cosmosClient.connectionPolicy.useMultipleWriteLocations: ${cosmosClient.clientContext.connectionPolicy.useMultipleWriteLocations}`);
    await Utils.Logger("cosmosClient.createClient", Utils.LogLevel.Debug, `cosmosClient.connectionPolicy.preferredLocations: ${cosmosClient.clientContext.connectionPolicy.preferredLocations}`);

    return [await tryConnect(cosmosClient), cosmosClient];
}

async function tryConnect(client) {
    try {
        let secretName = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.CosmosDBKeyFile : ConfigMaps.DefaultValues.CosmosDBSecret;
        let key = await KeyVaultClient.GetKey(secretName);
        if (client.clientContext.cosmosClientOptions.key != key) {
            cosmosclient = undefined;

            return false;
        }

        let endPoint = await client.getReadEndpoint();
        await Utils.Logger("cosmosClient.tryConnect", Utils.LogLevel.Debug, `client.getReadEndpoint: ${endPoint}`);

        return true;
    } catch (e) {
        await Utils.Logger("cosmosClient.tryConnect", Utils.LogLevel.Error, `CosmosDB connection failed: ${e.message}`);
        cosmosclient = undefined;

        return false;
    }
}