const ConfigMaps = require("../config/configMaps");
const CosmosClient = require("@azure/cosmos").CosmosClient;
const KeyVaultClient = require("./keyVaultClient");
const Utils = require("./../public/utils.js");
let registrationClient;

exports.createCosmosClient = async () => {
    try {
        if (typeof registrationClient === 'object') {
            if (await tryConnect(registrationClient)) {
                return registrationClient;
            }
        }

        await Utils.Logger("registrationClient.createCosmosClient", Utils.LogLevel.Debug, "The available RegistrationClient is not existing. Will create a new one.");
        let secretName = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.RegistrationDBKeyFile : ConfigMaps.DefaultValues.RegistrationDBSecret;
        let key = await KeyVaultClient.GetKey(secretName);
        let [ClientCanConnect, Client] = await createClient(key);
        if (!ClientCanConnect) {
            throw new Error("RegistrationClient connection failed.");
        }
        await Utils.Logger("registrationClient.createCosmosClient", Utils.LogLevel.Debug, "RegistrationClient connected successfully.");

        return Client;
    } catch (e) {
        await Utils.Logger("registrationClient.createCosmosClient", Utils.LogLevel.Error, `RegistrationClient creation failed: ${e.message}`);
        return null;
    }
};

async function createClient(key) {
    registrationClient = new CosmosClient(key);

    await Utils.Logger("registrationClient.createClient", Utils.LogLevel.Debug, `registrationClient.connectionPolicy.useMultipleWriteLocations: ${registrationClient.clientContext.connectionPolicy.useMultipleWriteLocations}`);
    await Utils.Logger("registrationClient.createClient", Utils.LogLevel.Debug, `registrationClient.connectionPolicy.preferredLocations: ${registrationClient.clientContext.connectionPolicy.preferredLocations}`);

    return [await tryConnect(registrationClient), registrationClient];
}

async function tryConnect(client) {
    try {
        //let secretName = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.RegistrationDBKeyFile : ConfigMaps.DefaultValues.RegistrationDBSecret;
        //let key = await KeyVaultClient.GetKey(secretName);
        //if (client.clientContext.cosmosClientOptions.key != key) {
        //    registrationClient = undefined;

        //    return false;
        //}

        let endPoint = await client.getReadEndpoint();
        await Utils.Logger("registrationClient.tryConnect", Utils.LogLevel.Debug, `client.getReadEndpoint: ${endPoint}`);

        return true;
    } catch (e) {
        await Utils.Logger("registrationClient.tryConnect", Utils.LogLevel.Error, `Registration DB connection failed: ${e.message}`);
        registrationClient = undefined;

        return false;
    }
}