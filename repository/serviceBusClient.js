const { ServiceBusClient } = require("@azure/service-bus");
const ConfigMaps = require("../config/configMaps");
const KeyVaultClient = require("./keyVaultClient");
const Utils = require("./../public/utils.js");
let serviceBusClient;

exports.createServiceBusClient = async () => {
    try {
        if (typeof serviceBusClient === 'object') {
            if (await tryConnect(serviceBusClient)) {
                return serviceBusClient;
            }
        }

        await Utils.Logger("serviceBusClient.createServiceBusClient", Utils.LogLevel.Debug, "The available ServiceBusClient is not existing. Will create a new one.");
        let secretName = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.ServiceBusRootAccessKeyFile : ConfigMaps.DefaultValues.ServiceBusSecret;
        let key = await KeyVaultClient.GetKey(secretName);
        let [ClientCanConnect, Client] = await createClient(key);
        if (!ClientCanConnect) {
            throw "ServiceBusClient connection failed.";
            return null;
        }
        await Utils.Logger("serviceBusClient.createServiceBusClient", Utils.LogLevel.Debug, "ServiceBusClient creation successfully.");

        return Client;
    } catch (e) {
        await Utils.Logger("serviceBusClient.createServiceBusClient", Utils.LogLevel.Error, `ServiceBusClient creation failed: ${e.message}`);

        return null;
    }
};

async function createClient(key) {
    serviceBusClient = new ServiceBusClient(key);

    return [await tryConnect(serviceBusClient), serviceBusClient];
}

async function tryConnect(client) {
    try {
        let topicName = ConfigMaps.DefaultValues.SERVICEBUS_TOPIC_EXPORT;
        await Utils.Logger("serviceBusClient.tryConnect", Utils.LogLevel.Debug, `topicName= ${topicName}.`);
        let sender = await client.createSender(topicName);
        let batch = await sender.createMessageBatch();
        let request = {
            "body": "Service Bus message sent from CosmosDBRestAPI.",
            "contentType": "application/json"
        };
        batch.tryAddMessage(request)
        //await sender.sendMessages(batch);
        await sender.close();
        await Utils.Logger("serviceBusClient.tryConnect", Utils.LogLevel.Debug, "Connected to ServiceBus successfully.");

        return true;
    } catch (e) {
        await Utils.Logger("serviceBusClient.tryConnect", Utils.LogLevel.Error, `Connected to ServiceBus failed: ${e.message}`);
        serviceBusClient = undefined;

        return false;
    }
}