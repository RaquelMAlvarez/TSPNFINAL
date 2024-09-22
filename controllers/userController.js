const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userModel = require('../models/user');
const authController = require('./authController');

function usernamePasswordFilledIn(username, password, res, redirectPageName) {
    if(!username || username === "" || !password || password === "") {
        console.log("Username or password is missing");
        res.render(redirectPageName, { message: "Please fill in username and password"});
        return false;
    } else {
        console.log("Username and password are filled in");
        return true;
    };
};

function passwordFilledIn(password, res, redirectPageName) {
    if(!password || password === "") {
        console.log("Password is missing");
        res.render(redirectPageName, { message: "Please fill in password"});
        return false;
    } else {
        console.log("Password is filled in");
        return true;
    };
};

function login(req, res) {
    //validate user
    const username = req.body.username;
    const password = req.body.password;
    console.log("Username: ", username);

    if (!usernamePasswordFilledIn(username, password, res, "user/login")) return;

    userModel.getUser(username).then(function(foundUser) {
        if (!foundUser) {
            console.log("user ", username, " not found");
            res.render("user/register", { message: "Unknown user, please register first"});
        } else {
            // compare provided password with the stored hash
            bcrypt.compare(password, foundUser.password, function(_, success) {
                if (!success) {
                    console.log("passwords don't match");
                    res.render("user/login", { message: "Invalid password"});
                } else {
                    console.log("user ", username, " found and passwords match");
                    // store a cookie
                    const token = { username: username, access_rights: foundUser.access_rights };
                    //create the access token
                    const accessToken = jwt.sign(token, process.env.ACCESS_TOKEN_SECRET,{expiresIn: 600}); 
                    res.cookie("jwt", accessToken);
                    console.log("user ", username, " logged in");
                    res.redirect("/");
                };
            });
        };
    },
    function(err) {
        console.log("error looking up user", err);
        res.render("user/login", { message: "Unknown error, please try again later"});
    });
};

function showLogin(_, res) {
    res.render("user/login");
};

function logout(_, res) {
    res.clearCookie("jwt");
    console.log("cleared cookies");
    res.render("home", { message: "You have been logged out.", access_rights: "guest"});
};

function isPasswordValid(password, res, redirectPageName) {
    console.log("Password length is: ", password.length);
    if(password.length < 8) {
        console.log("Password is too short");
        res.render(redirectPageName, { message: "Password needs to have at least 8 characters"});
        return false;
    } else {
        console.log("Password is valid");
        return true;
    };
};

function register(req, res) {
    const user = { 
        username: req.body.username,
        password: req.body.password,
        access_rights: "user"
    };
    const username = user.username;
    if (!usernamePasswordFilledIn(username, user.password, res, "user/register")) return;
    if (!isPasswordValid(user.password, res, "user/register")) return;

    console.log("Registering username: ", username);

    // validate if user already exists
    userModel.getUser(username).then(function(foundUser) {
        if (foundUser) {
            console.log("username ", username, " already exists");
            // user already exists
            res.render("user/register", { message: "This username is already taken, please create a different one"});
        } else {
            console.log("username ", username, " is available");
            //create the user
            userModel.add(user).then(function() {
                console.log("User was added, logging in...");
                login(req, res);
            });
        };
    },
    function(err) {
        console.log("error validating username", err);
        // something went wrong, please try again
        res.render("user/register", { message: "something went wrong, please try again"});
    });
};

function showRegister(_, res) {
    res.render("user/register");
};

function showChangePassword(_, res) {
    res.render("user/change_password");
};

function changePassword(req, res) {

    // load username from cookie
    const token = authController.getLoggedInUserToken(req);
    if (!token) {
        console.log("No user is logged in");
        res.render("user/login", { message: "Please login first before changing the password"});
    }
    const username = token.username;

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    // validate password requirements
    if (!passwordFilledIn(oldPassword, res, "user/change_password")) return
    if (!passwordFilledIn(newPassword, res, "user/change_password")) return
    if (!isPasswordValid(newPassword, res, "user/change_password")) return

    // find the user we want to update in the database
    userModel.getUser(username).then(function (currentUser) {
        console.log("Current user: ", currentUser);

        // if the user is not found report an error
        if (!currentUser) {
            console.log("User ", username, " not found");
            res.render("user/login", { message: "Please login first before changing the password"});
            return;
        }
    

        // validate that passwords match
        bcrypt.compare(oldPassword, currentUser.password, function(_, success) {
            if (!success) {
                console.log("passwords don't match");
                res.render("user/change_password", { message: "Old password is incorrect"});
            } else {
                // update the user in database
                userModel.updatePassword(username, newPassword).then(function(_) {
                    console.log("Password was changed, logging in with the new password");
                    req.body = { username: username, password: newPassword };
                    login(req, res); 
                },
                function(err) {
                    console.log("failed to change password with error:", err)
                });
            };
        });
    },
    function(err) {
        console.log("Falied to find user ", username, "with error:", err);
    });
};

function showUsers(_, res) {
    const users = userModel.getAllUsers();
    users.then((user_items) => {
            res.render("user/users", {
                users: user_items
        })})
        .catch((err) => {
            console.log("promise rejected", err);
        });
};

function showUsersPage(req, res) {
    authController.requireAdminAccess(req, res, "view users", showUsers);
};

function deleteUser(req, res) {
    // parse username from request
    const username = req.params.username
    if (!username) {
        console.log("Missing username parameter");
        res.status(400).send("Please specify the username parameter");
        return;
    }

    // find the user we want to delete in the database
    userModel.getUser(username).then(function (currentUser) {
        console.log("Current user:", currentUser);

        // if the user is not found report an error
        if (!currentUser) {
            console.log("User", username, "not found");
            res.status(404).send("User", username, "not found");
            return;
        }

        // delete the user in database
        userModel.remove(username).then(function(_) {
            console.log("User", username, "was deleted"); 
            res.status(204).send("User", username, "was deleted");
        },
        function(err) {
            console.log("failed to delete user", username, "with error:", err);
        });
    },
    function(err) {
        console.log("Falied to find user", username, "with error:", err);
    });
}

function deleteUserPage(req, res) {
    authController.requireAdminAccess(req, res, "delete user", deleteUser);
};

module.exports = { login, showLogin, logout, register, showRegister, changePassword, showChangePassword, showUsersPage, deleteUserPage };


