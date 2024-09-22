const jwt = require("jsonwebtoken");

function getLoggedInUserToken(req) {
    // read access token from cookies
    const accessToken = req.cookies.jwt;
    if (!accessToken) {
        return null
    }
    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("JWT token: ", decodedToken)
        return decodedToken
    } catch (e) {
        //if an error occured, user is not logged in
        console.log("JWT verification failed with error:", e)
        // if no user is logged in, show next page with guest access rights
        return null
    }
}

function getAccessRights(req) {
    let access_rights
    // get token of currently logged in user from cookies
    const token = getLoggedInUserToken(req)

    if (!token) {
        // there is no token, user is not logged in
        access_rights = "guest"
    } else {
        // user is logged in, we setup access rights according to the access token
        access_rights = token.access_rights
    }
    console.log("Access rights: ", access_rights)
    return access_rights
}

function requireAccess(req, res, requiredAccessRights, actionName, successFunction) {
    let access_rights = getAccessRights(req)
    console.log("access rights: ", access_rights)
    if ((requiredAccessRights == "user" && (access_rights == "user" || access_rights == "admin")) 
        || requiredAccessRights == "admin" && access_rights == "admin") {
        console.log("User has correct access rights, calling the success function...")
        successFunction(req, res)
    } else {
        console.log("User does not have required access rights, rendering login page...")
        res.render("user/login", { message: `You need to be logged in with ${requiredAccessRights} access rights to ${actionName}` })
    }
}

function requireUserAccess(req, res, actionName, successFunction) {
    requireAccess(req, res, "user", actionName, successFunction)
}

function requireAdminAccess(req, res, actionName, successFunction) {
    requireAccess(req, res, "admin", actionName, successFunction)
}

module.exports = { getLoggedInUserToken, getAccessRights, requireUserAccess, requireAdminAccess }