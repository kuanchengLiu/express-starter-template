const ConfigMaps = require("../config/configMaps");
const CosmosClient = require("@azure/cosmos").CosmosClient;
const KeyVaultClient = require("./keyVaultClient");
const Utils = require("./../public/utils.js");
let auditingCosmosClient;

exports.createCosmosClient = async () => {
    try {
        if (typeof auditingCosmosClient === 'object') {
            if (await tryConnect(auditingCosmosClient)) {
                return auditingCosmosClient;
            }
        }

        await Utils.Logger("prismAuditCosmosClient.createCosmosClient", Utils.LogLevel.Debug, "The available Auditing CosmosClient is not existing. Will create a new one.");
        let secretName = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.CosmosDBKeyFile : ConfigMaps.DefaultValues.CosmosDBSecret;
        let key = await KeyVaultClient.GetKey(secretName);
        let [ClientCanConnect, Client] = await createClient(key);
        if (!ClientCanConnect) {
            throw "Auditing CosmosClient connection failed.";
            return null;
        }
        await Utils.Logger("prismAuditCosmosClient.createCosmosClient", Utils.LogLevel.Debug, "Auditing CosmosDBClient connected successfully.");

        return Client;
    } catch (e) {
        await Utils.Logger("prismAuditCosmosClient.createCosmosClient", Utils.LogLevel.Error, `Auditing CosmosClient creation failed: ${e.message}`);

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
    auditingCosmosClient = new CosmosClient({
        endpoint: process.env.COSMOS_HOST || ConfigMaps.DefaultValues.CosmosDBEndpoint,
        key: key,
        connectionPolicy: connectionPolicy
    });

    await Utils.Logger("prismAuditCosmosClient.createClient", Utils.LogLevel.Debug, `cosmosClient.connectionPolicy.useMultipleWriteLocations: ${auditingCosmosClient.clientContext.connectionPolicy.useMultipleWriteLocations}`);
    await Utils.Logger("prismAuditCosmosClient.createClient", Utils.LogLevel.Debug, `cosmosClient.connectionPolicy.preferredLocations: ${auditingCosmosClient.clientContext.connectionPolicy.preferredLocations}`);

    return [await tryConnect(auditingCosmosClient), auditingCosmosClient];
}

async function tryConnect(client) {
    try {
        let secretName = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.CosmosDBKeyFile : ConfigMaps.DefaultValues.CosmosDBSecret;
        let key = await KeyVaultClient.GetKey(secretName);
        if (client.clientContext.cosmosClientOptions.key != key) {
            auditingCosmosClient = undefined;

            return false;
        }

        let endPoint = await client.getReadEndpoint();
        await Utils.Logger("prismAuditCosmosClient.tryConnect", Utils.LogLevel.Debug, `client.getReadEndpoint: ${endPoint}`);

        return true;
    } catch (e) {
        await Utils.Logger("prismAuditCosmosClient.tryConnect", Utils.LogLevel.Error, `Auditing CosmosDB connection failed: ${e.message}`);
        auditingCosmosClient = undefined;

        return false;
    }
}