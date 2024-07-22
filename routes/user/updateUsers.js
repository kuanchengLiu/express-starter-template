'use strict';

/************************************************
 * version : 01.00.00.00 - 08/07/2021
 * Class/Method : updateUsers.js
 * Description : This script update email addresses of a PM or L2 user in Users conatiner
 ************************************************/
/************************************************************************************
 *  Updates the email info for PM or L2
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
 *   https://XXXX:3000/updateUsers
 * {"Role": "L2", "Fullname": "user name",    "Email": "user.name@hp.com","MGREmail" : "avbc@hp.com","CreatedBy": "RR"}
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
    let response = new ResponseBodyGenerator("An issue occured, please contact support team.", "POST /cosmosapi/updateUsers");

    try {
        const Client = await CosmosClient.createCosmosClient();

        let obj = req.body;

        let name = obj.Fullname.toUpperCase().trim();
        let role = obj.Role.toUpperCase().trim();
        let mgrEmail = obj.MGREmail;
        let email = obj.Email;
        let description = "update user";
        let updatedBy = obj.UpdatedBy;
        let toEmailsArray = [];
        let message;

        //toEmailsArray.push(emailConstants.Recipients);

        if ((email === null || email === "" || typeof (email) === "undefined") && (mgrEmail === null || mgrEmail === "" || typeof (mgrEmail) === "undefined")) {
            response = new ResponseBodyGenerator("No thing changes!", "POST /cosmosapi/getUsers");

            return res.status(HttpStatus.OK).json(await response.successResponseBody(""));
        }

        //checking sending mail and mail insertion flag
        //let directTableInsertRequire = directTableInsert.UpdateUser_UpdatedBy;
        //let emailRequire = emailReq.UpdateUser_UpdatedBy;

        let querySpec = {
            query: "select * from r where TRIM(UPPER(r.Fullname)) = @name and TRIM(UPPER(r.Role)) =@role",
            parameters: [{ name: "@name", value: name }, { name: "@role", value: role }]
        };

        // read all items in the Items container
        const { resources: UserItems } = await Client.database(CosmosObjects.DatabaseName).container(CosmosObjects.Users).items
            .query(querySpec)
            .fetchAll();

        let userLen = UserItems.length;

        if (userLen === 1) {

            let id = UserItems[0].id;
            let fullName = UserItems[0].Fullname;

            obj = UserItems[0];

            if (mgrEmail === null || mgrEmail === '' || typeof (mgrEmail) === "undefined") {
                await Utils.Logger("updateUsers", Utils.LogLevel.Info, "No Changes in MGREmail");
            } else {
                obj['MGREmail'] = mgrEmail;
            }

            if (email === null || email === '' || typeof (email) === "undefined") {
                await Utils.Logger("updateUsers", Utils.LogLevel.Info, "No Changes in Email");
            } else {
                obj['Email'] = email;
            }

            obj['UpdatedDt'] = new Date().toISOString();

            const { resource: UpdatedUserItem } = await Client.database(CosmosObjects.DatabaseName).container(CosmosObjects.Users)
                .item(id, fullName)
                .replace(obj)

            UpdatedUserItem['UpdatedBy'] = updatedBy;

            let auditInput;

            auditInput = {
                "Action": "Update",
                "AppName": "CosmosRestAPI",
                "ContainerName": CosmosObjects.Users,
                "Source": "PDNGPrismCloudAPI",
                "EventTime": new Date().toISOString(),
                "Decsription": UpdatedUserItem
            };

            await Utils.Logger("updateUsers", Utils.LogLevel.Info, JSON.stringify(auditInput));

            message = UpdatedUserItem;

            if (updatedBy === null || updatedBy === "" || typeof (updatedBy) === "undefined") {

                //if ((emailRequire !== "NO") || (directTableInsertRequire !== "NO")) {
                //    // Albert: send email (send message to ServiceBus)
                //    //UtilsMail.MailFunction(toEmailsArray, emailConstants.NullGrating, emailConstants.NullMessage.concat(description, emailConstants.UpdatedBy, "for user "),
                //    //    emailConstants.UpdatedBySubject.concat(emailConstants.NullSubject, description, " notification"),
                //    //    name, emailConstants.Regards, emailConstants.DoNotReply, description,
                //    //    emailRequire, directTableInsertRequire, emailConstants.AlertType, req, res);
                //} else {
                //    console.log('Not sending email notification to users and not inserting in to the direct table');
                //}
            }

            await Utils.Logger("updateUsers", Utils.LogLevel.Error, `User updated successfully - ${obj.Fullname} ${role}`);
        } else if (userLen > 1) {
            return res.status(HttpStatus.BAD_REQUEST).json(await response.errorResponseBody(90048));
        } else {
            return res.status(HttpStatus.NOT_FOUND).json(await response.errorResponseBody(90047));
        }
        response = new ResponseBodyGenerator("User email updated successfully! " + obj.Fullname + ' ' + role, "POST /cosmosapi/updateUsers");

        return res.status(HttpStatus.OK).json(await response.successResponseBody(message));

    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(await response.errorResponseBody(e.message));
    }
};
