const FS = require("fs");
const ConfigMaps = require("../config/configMaps");

class ResponseBodyGenerator {

    constructor(message, endpoint) {
        this.timestamp = new Date().toISOString()
        this.message = message;
        this.endpoint = endpoint;
    }

    // {
    //     "Timestamp": "2020-07-01T12:34:56.789Z",
    //     "Message": "Incorrect username and password",
    //     "Result": { "data": "Some data" }
    //     "Endpoint": "GET /api/ooo/1",
    // }
    successResponseBody(result) {
        const responseBody = {
            Endpoint: this.endpoint,
            Timestamp: this.timestamp,
            Message: this.message,
            Result: result
        };

        return responseBody;
    }

    // {
    //     "Timestamp": "2020-07-01T12:34:56.789Z",
    //     "ErrorCode": "auth-0001",
    //     "Message": "Incorrect username and password",
    //     "Endpoint": "GET /api/ooo/1",
    //     "Suggestion": "https://example.com/help/error/auth-0001"
    // }
    async errorResponseBody(errorCode) {
        const unexpectedError = "Unexpected error occurred while processing the request.";
        const configObject = await this.getErrorMessage(errorCode);
        const responseBody = {
            Timestamp: this.timestamp,
            ErrorCode: configObject.Message == unexpectedError ? "0000" : errorCode,
            Endpoint: this.endpoint,
            Suggestion: configObject.Suggestion,
            Message: configObject.Message == unexpectedError ? configObject.Message + ' error message: ' + errorCode : configObject.Message,
        };

        return responseBody;
    }

    async getErrorMessage(code) {
        try {
            let path = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.ConfigmapPath_ErrorMessages : ConfigMaps.DefaultValues.ConfigmapLocalPath_ErrorMessages;
            let message;
            let configFile = JSON.parse(await FS.readFileSync(path, 'utf-8'));
            if (configFile[code]) {
                message = configFile[code];
            }
            return message !== undefined ? message : configFile["0000"];
        } catch (e) {
            return {
                ErrorCode: "0001",
                Message: `An error occurred while retrieving the error message. Error: ${e.message}.`,
                Suggestion: ""
            };
        }
    }
}

module.exports = ResponseBodyGenerator;
