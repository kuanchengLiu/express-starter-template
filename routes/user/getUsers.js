'use strict';

/************************************************
 * version : 01.00.00.00 - 19/10/2020
 * Class/Method : getUsers.js
 * Description : This script gets user details for a given role from users conatiner in PrismDB
 ************************************************/
/************************************************************************************
 *  Lists out the users for the given role - PM or L2
 *
 *   A valid json have the following valid input:
 *      + Role cannot be empty or null,
 *
 *  Parameter:
 *      + query parameter
 *
 *  Samples:
 *   https://XXXX:3000/getUsers?Role=PM
 *
 ************************************************************************************/

//  <ImportConfiguration>
const CosmosClient = require("../../repository/cosmosClient.js");
const CosmosObjects = require("../../public/constants/cosmosObjects.js");
const HttpStatus = require('http-status');
const Utils = require("../../public/utils.js");
const ResponseBodyGenerator = require("../../public/responseBodyGenerator.js");

//  </ImportConfiguration>

module.exports = async (req, res) => {
    let response = new ResponseBodyGenerator("An issue occured, please contact support team.", "POST /cosmosapi/getUsers");

    try {
        const Client = await CosmosClient.createCosmosClient();

        let role = req.query.Role;

        let querySpec = {
            query: "select r.Fullname from r where TRIM(UPPER(r.Role)) = TRIM(UPPER(@Role))",
            parameters: [{ name: "@Role", value: role }]
        };

        // read all items in the Servers container
        const { resources: items } = await Client.database(CosmosObjects.DatabaseName).container(CosmosObjects.Users).items
            .query(querySpec)
            .fetchAll();

        if (items.length >= 1) {
            response = new ResponseBodyGenerator("Users found successfully!", "POST /cosmosapi/getUsers");

            await Utils.Logger("getUsers", Utils.LogLevel.Info, `New user: ${JSON.stringify(response)}`);

            return res.status(HttpStatus.OK).json(await response.successResponseBody(items.map(data => data.Fullname)));
        } else {
            return res.status(HttpStatus.NOT_FOUND).json(await response.errorResponseBody(90037));
        }

    } catch (e) {
        await Utils.Logger("getUsers", Utils.LogLevel.Error, e.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(await response.errorResponseBody(e.message));
    }
};
