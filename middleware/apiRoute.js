const RouteConsts = require("../public/constants/definitoins");

const apiRoutes = [

    // delete

    // get
    { method: 'get', controller: RouteConsts.user.getUsers.controller, path: RouteConsts.user.getUsers.route, schema: RouteConsts.user.getUsers.schema },
    { method: 'get', controller: RouteConsts.other.controller, path: RouteConsts.other.route, schema: RouteConsts.other.schema },

    // post
    { method: 'post', controller: RouteConsts.user.addPML2.controller, path: RouteConsts.user.addPML2.route, schema: RouteConsts.user.addPML2.schema },

    // put
    { method: 'put', controller: RouteConsts.user.updateUsers.controller, path: RouteConsts.user.updateUsers.route, schema: RouteConsts.user.updateUsers.schema },
];

module.exports = apiRoutes;