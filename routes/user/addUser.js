"use strict";

/************************************************
 * version : 01.00.00.00 - 08/07/2021
 * Class/Method : addPML2.js
 * Description : This script inserts a PM or L2 user in Users conatiner
 ************************************************/
/************************************************************************************
 *  Deletes the server
 *
 *   A valid json have the following valid input:
 *      + Role cannot be empty or null,
 *      + Fullname of user cannot be null
 *      + email add cannot be null or empty
 *      + if L2 user is added then mgr email cannot be null
 *
 *  Parameter:
 *      + query parameter
 *
 *  Samples:
 *   https://XXXX:3000/addPML2
 * {"Role": "L2", "Fullname": "user name",    "Email": "user.name@hp.com","MGREmail" : "avbc@hp.com","CreatedBy": "RR"}
 *
 ************************************************************************************/

//  <ImportConfiguration>
const CosmosClient = require("../../repository/cosmosClient.js");
const CosmosObjects = require("../../public/constants/cosmosObjects.js");
const HttpStatus = require("http-status");
const Utils = require("../../public/utils.js");
const ResponseBodyGenerator = require("../../public/responseBodyGenerator.js");
const sprintf = require('sprintf-js').sprintf;
//  </ImportConfiguration>

module.exports = async (req, res) => {

};
