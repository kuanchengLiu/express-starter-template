// JavaScript source code

/************************************************
 * This script have all utils methods of CosmosDBRestAPI
 * Anita D - 23/04/2021
 * version : 01.00.00.00
 * Related to PBI 10294
 ************************************************/

//  <ImportConfiguration>
const ConfigMaps = require("../config/configMaps");
const Crypto = require("crypto");
const FS = require("fs");
const ServiceBusClient = require("./../repository/serviceBusClient");
const _this = this;
const CosmosObjects = require("../public/constants/cosmosObjects.js");
const tracker = require("../app.js");
const CustomError = require('../public/errors/customError.js');
//  </ImportConfiguration>

exports.getDisableAlertTypes = async function (inputType) {
    try {
        let path = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.ConfigmapPath_Other_Message : ConfigMaps.DefaultValues.ConfigmapLocalPath_Other_Message;
        let configFile = await FS.readFileSync(path, 'utf-8');
        return configFile.split(',').includes(inputType);
    } catch (e) {
        await _this.Logger("getDisableAlertTypes", _this.LogLevel.Error, `Failed to get DisableAlertTypes. Exception: ${e.message}.`);
        throw e;
    }
}

exports.SendNotication = async function (
    message,
    additionalReceiver = "",
    alertTimeStamp = new Date().toISOString(),
    alertType = "GeneralAlert",
    skuNumber = "",
    application = "CosmosDBRestAPI",
    skuRevision = 0,
    PDNGTranID = "",
    segmentLength = 250000
) {
    try {

        let isDisableType = await this.getDisableAlertTypes(alertType);

        if (isDisableType) {
            throw new CustomError("Alert type is disabled", 90050);
        }

        // Generate the message list
        let messageList = [];
        let startIndex = 0;
        let itemIndex = 0;
        let totalItemCount = Math.ceil(message.length / segmentLength);
        let sessionId = Crypto.randomBytes(16).toString("hex");
        while (startIndex < message.length) {
            let messageSegment = message.substring(startIndex, startIndex + segmentLength);
            itemIndex += 1;
            messageList.push({
                AlertType: alertType,
                SkuNumber: skuNumber,
                Application: application,
                Message: messageSegment,
                AdditionalReceiver: additionalReceiver,
                AlertTimeStamp: alertTimeStamp,
                Region: process.env.REGION ?? "ea",
                Environment: process.env.CONFIG_ENVIRONMENT_PROFILE ?? "dev",
                TotalItemCount: totalItemCount,
                CurrentItemCount: itemIndex,
                SessionID: sessionId,
                SkuRevision: parseInt(skuRevision),
                PDNGTranID: PDNGTranID
            });

            startIndex += segmentLength;
        }

        let topicName = await _this.GetConfig("SERVICEBUS_TOPIC_NOTIFICATION") ?? ConfigMaps.DefaultValues.SERVICEBUS_TOPIC_NOTIFICATION;
        await _this.PushMeassageOnTopic(messageList, topicName);
        await _this.Logger("utils.SendNotication", _this.LogLevel.Info, `Successfully sent message to the topic: ${topicName}`);
    } catch (e) {
        let errorMessage = `An error occurred while sending the notication. Error: ${e.message}.`;
        await _this.Logger("utils.SendNotication", _this.LogLevel.Error, errorMessage);

        throw e;
    }
}

exports.PushMeassageOnTopic = async function (objects, topicName) {
    try {
        const SBClient = await ServiceBusClient.createServiceBusClient();

        if (
            objects === null ||
            objects === "" ||
            typeof objects === "undefined" ||
            JSON.stringify(objects) === "{}"
        ) {
            let msg = "Service bus message can not be null or empty";
            await _this.Logger("utils.PushMeassageOnTopic", _this.LogLevel.Error, msg);
            throw new Error(msg);
        }

        if (topicName === null || objects === "" || typeof objects === "undefined") {
            let msg = `Topic is invalid. Topic name = ${topicName}`;
            await _this.Logger("utils.PushMeassageOnTopic", _this.LogLevel.Error, msg);
            throw new Error(msg);
        }

        await _this.Logger("utils.PushMeassageOnTopic", _this.LogLevel.Debug, `topicName= ${topicName}.`);

        let sender = SBClient.createSender(topicName);

        // Tries to send all messages in a single batch.
        // Will fail if the messages cannot fit in a batch.
        // await sender.sendMessages(messages);

        // Sends all messages using one or more ServiceBusMessageBatch objects as required
        let batch = await sender.createMessageBatch();

        if (!Array.isArray(objects)) {
            objects = [objects];
        }

        for (const message of objects) {
            let request = {
                body: message,
                contentType: "application/json",
            };

            if (!batch.tryAddMessage(request)) {
                // Send the current batch as it is full and create a new one
                await sender.sendMessages(batch);
                batch = await sender.createMessageBatch();

                if (!batch.tryAddMessage(request)) {
                    throw new Error("Message too big to fit in a batch");
                }
            }
        }

        await sender.sendMessages(batch);
        await sender.close();
        await _this.Logger("utils.PushMeassageOnTopic", _this.LogLevel.Info, `Successfully sent message to the topic: ${topicName}`);
    } catch (e) {
        await _this.Logger("utils.PushMeassageOnTopic", _this.LogLevel.Error, `Failed to send message to Service Bus. Exception: ${e.message}`);
        throw e;
    }
};

exports.GetConfig = async function (configName) {
    try {
        let path = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.ConfigmapPath : ConfigMaps.DefaultValues.ConfigmapLocalPath;
        let configFile = JSON.parse(await FS.readFileSync(path, 'utf-8'));
        let commonConfigurations = configFile["Common"];
        let appConfigurations = configFile["CosmosDBRestAPI"];
        let configurations = Object.assign(commonConfigurations, appConfigurations);
        if (configurations[configName]) {
            return configurations[configName];
        } else {
            return `Config '${configName}' is undefined.`;
        }
    } catch (e) {
        let errorMessage = `An error occurred while retrieving the config. Error: ${e.message}.`;
        await _this.Logger("utils.GetConfig", _this.LogLevel.Error, errorMessage);

        return null;
    }
};

exports.GetREGEXConfig = async function (configName) {
    try {
        let path = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.ConfigmapPath_REGEX : ConfigMaps.DefaultValues.ConfigmapLocalPath_REGEX;
        let configFile = JSON.parse(await FS.readFileSync(path, 'utf-8'));
        if (configFile[configName]) {
            return configFile[configName];
        } else {
            return `Config '${configName}' is undefined.`;
        }
    } catch (e) {
        let errorMessage = `An error occurred while retrieving the REGEX config. Error: ${e.message}.`;
        await _this.Logger("utils.GetREGEXConfig", _this.LogLevel.Error, errorMessage);

        return null;
    }
};

exports.GetErrorMessage = async function (code, errorMessage = "", errorObject = null) {
    try {
        let path = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.ConfigmapPath_ErrorMessages : ConfigMaps.DefaultValues.ConfigmapLocalPath_ErrorMessages;
        let message;
        let configFile = JSON.parse(await FS.readFileSync(path, 'utf-8'));
        if (configFile[code]) {
            message = configFile[code] + errorMessage;
        } else {
            message = `ErrorCode '${code}' is undefined.`
        }

        return {
            timestamp: new Date().toISOString(),
            message: message,
            error_code: code,
            error_object: errorObject,
        };
    } catch (e) {
        let errorMessage = `An error occurred while retrieving the error message. Error: ${e.message}.`;
        await _this.Logger("utils.GetErrorMessage", _this.LogLevel.Error, errorMessage);

        return {
            timestamp: new Date().toISOString(),
            message: errorMessage,
            error_code: code,
            error_object: errorObject,
        };
    }
};

exports.GetAppVersion = async function () {
    try {
        let path = "package.json";
        let packageFile = JSON.parse(await FS.readFileSync(path, 'utf-8'));
        if (packageFile.version) {
            return packageFile.version;
        } else {
            return `The property 'version' is undefined in package.json file.`;
        }
    } catch (e) {
        let errorMessage = `An error occurred while retrieving the version value. Error: ${e.message}.`;
        await _this.Logger("utils.GetAppVersion", _this.LogLevel.Error, errorMessage);

        return null;
    }
};

exports.updateBuildPlan = async function (oriServerItem, buildPlan, Client) {

    try {
        let obj = oriServerItem;
        let id = oriServerItem.id;
        let serverNameOri = oriServerItem.Servername;
        obj['UpdatedDt'] = new Date().toISOString();
        obj['Buildplan'] = buildPlan;
        const { resource: UpdatedItem } = await Client.database(CosmosObjects.DatabaseName).container(CosmosObjects.Servers)
            .item(id, serverNameOri)
            .replace(obj);

        let auditInput = {
            "Action": "Update",
            "AppName": "CosmosRestAPI",
            "ContainerName": CosmosObjects.Servers,
            "Source": "PDNGPrismCloudAPI",
            "EventTime": new Date().toISOString(),
            "Decsription": UpdatedItem
        };

        await _this.Logger("updateBuildPlan", _this.LogLevel.Info, JSON.stringify(auditInput));

        return {
            "timestamp": new Date().toISOString(),
            "message": "Buildplan updated on server successfully",
            "result": UpdatedItem
        };

    } catch (e) {
        await _this.Logger("updateBuildPlan", _this.LogLevel.Error, `update to site masters buildplan failed: ${e.message}`);

        if (e.code) {
            throw new CustomError(e.message, e.code);
        }
        throw e;
    }
}

exports.Logger = async function (functionName, logLevel, logMessage) {
    try {
        console.log(`[${new Date().toISOString()}][CosmosDBRestAPI][${functionName}][${logLevel}][${tracker?.tracer().xRequestID}][${tracker?.tracer().PDNGTranID}]: ${logMessage}`);
    } catch (e) {
        console.log(`[${new Date().toISOString()}][CosmosDBRestAPI][${functionName}][${logLevel}]: ${logMessage}`);
    }
};

/**
 * Combines two arrays and returns a new array containing unique elements from both arrays.
 * @param {Array} serverOriginalBuildPlan - The original build plan array.
 * @param {Array} updatedBuildPlan - The updated build plan array.
 * @returns {Array} - The combined array with unique elements.
 */
exports.combineUnique = function (serverOriginalBuildPlan, updatedBuildPlan) {
    return Array.from(new Set(serverOriginalBuildPlan.concat(updatedBuildPlan)));
}

exports.LogLevel = Object.freeze({
    Debug: "DEBUG",
    Error: "ERROR",
    Info: "INFO"
})