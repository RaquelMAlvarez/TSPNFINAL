const authController = require('./authController');

function showHomePage(req, res, message) {
    let access_rights = authController.getAccessRights(req)
    let logged_in = access_rights != "guest"
    let admin = access_rights == "admin"
    res.render("home", { logged_in: logged_in, admin: admin, message:message })
}

module.exports = { showHomePage }