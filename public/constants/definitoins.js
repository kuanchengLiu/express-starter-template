const RouteConsts = {
    other: {
        controller: require("../../routes/other/healthCheck.js"),
        route: '/healthCheck',
        schema: null
    },
    user: {
        addPML2: {
            controller: require("../../routes/user/addUser.js"),
            route: '/addPML2',
            schema: require('../../model/user/addPML2Schema.js')
        },
        getUsers: {
            controller: require("../../routes/user/getUsers.js"),
            route: '/getUsers',
            schema: require('../../model/user/getUsersSchema.js')
        },
        updateUsers: {
            controller: require("../../routes/user/updateUsers.js"),
            route: '/updateUsers',
            schema: require('../../model/user/updateUsersSchema.js')
        }
    }
};

module.exports = Object.freeze(RouteConsts);