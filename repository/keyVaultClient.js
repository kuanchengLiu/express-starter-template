'use strict';

const { SecretClient } = require("@azure/keyvault-secrets");
const { AzureCliCredential } = require("@azure/identity");
const ConfigMaps = require("../config/configMaps");
const FS = require('fs');
const Utils = require("./../public/utils.js");

exports.GetKey = async function (secretName) {
    try {
        if (process.env.CONFIG_ENVIRONMENT_PROFILE) {
            // On cloud environment, get the keys from a mounted file instead of connecting to Key Vault directly.
            let keyPath = `${ConfigMaps.DefaultValues.KeysPath}${secretName}`;
            return new Promise((resolve, reject) => {
                FS.readFile(keyPath, function (error, data) {
                    if (error) {
                        return reject(error)
                    };

                    resolve(data.toString());
                })
            });
        } else {
            // On local evnironment, since we do not have a mounted file so we get keys with AzureCliCredential from Key Vault.            
            let azureCliCredential = new AzureCliCredential();           
            const secretClient = new SecretClient(ConfigMaps.DefaultValues.KeyVaultEndpoint, azureCliCredential);
            let key = await secretClient.getSecret(secretName);

            return key.value;
        }
    } catch (e) {
        await Utils.Logger("keyVaultClient.GetKey", Utils.LogLevel.Error, e.message);

        return null;
    }
};