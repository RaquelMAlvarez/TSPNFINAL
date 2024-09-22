const nedb = require("nedb");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userDb = new nedb({ filename: "data/user.db", autoload: true });
console.log("user db loaded");

function getUser(username) {
    return new Promise((resolve, reject) => {
        console.log("Looking up user: ", username);

        userDb.find({'username': username}, function (err, foundUsers) {
            if (err) {
                console.log("error finding user", username, ": ", err);
                reject(err);
            } else if (foundUsers.length == 0) {
                console.log("user", username, "not found");
                resolve(null);
            } else {
                const foundUser = foundUsers[0];
                console.log("found user: ", foundUser);
                resolve(foundUser);
            };
        });
    });
};

function getAllUsers() {
    return new Promise((resolve, reject) => {
        userDb.find({}, function(err, users) {
            if (err) {
                console.log("Error loading users", err);
                reject(err);
            } else {
                console.log("Users loaded", users);
                resolve(users);
            };
        });
    });
};

function add(user) {
    var user = {
        username: user.username,
        password: user.password,
        access_rights: user.access_rights
    };

    return new Promise((resolve, reject) => {
        console.log("Adding user: ", user);

        // calculate hash of the password
        bcrypt.hash(user.password, saltRounds).then(function(hash) {
            // replace unencrypted password with hashed one
            user.password = hash;
            
            userDb.insert(user, function(err, newUser) {
                if (err) {
                console.log("Error inserting user", user);
                reject(err);
                } else {
                console.log("User inserted into database", newUser);  
                resolve(newUser);
                };
            });
        });
    });
};

function updatePassword(username, newPassword) {
    return new Promise((resolve, reject) => {
        // find the user we want to update in the database
        getUser(username).then(function(currentUser) {
            // if the user is not found report an error
            if (!currentUser) {
                console.log("User", username, "not found");
                reject("User not found");
            } else {
                //update the user
                console.log("Updating password for user: ", username);
                // calculate hash of the password
                bcrypt.hash(newPassword, saltRounds).then(function(hash) {
                    // replace unencrypted password with hashed one
                    currentUser.password = hash;
                    
                    userDb.update({ _id: currentUser._id }, { $set: currentUser }, {}, function(err, numberUpdated) {
                        if (err) {
                            console.log("Error updating user", currentUser);
                            reject(err);
                        } else {
                            console.log("Updated", numberUpdated, "user in database");
                            userDb.loadDatabase();
                            resolve(numberUpdated);
                        };
                    });
                });
            };
        });
    },
    function(err) {
        // if the user search fails report an error
        console.log("error looking up user", err);
        reject("User not found");
    });
};

function remove(username) {
    return new Promise((resolve, reject) => {
        // find the user we want to delete in the database
        getUser(username).then(function(currentUser) {
            // if the user is not found report an error
            if (!currentUser) {
                console.log("User", username, "not found");
                reject("User not found");
            } else {
                //delete the user
                console.log("Deleting user: ", username);  
                userDb.remove({ _id: currentUser._id }, {}, function(err, numberDeleted) {
                    if (err) {
                        console.log("Error deleting user", currentUser);
                        reject(err);
                    } else {
                        console.log("Deleted", numberDeleted, "user in database");
                        userDb.loadDatabase();
                        resolve(numberDeleted);
                    };
                });
            };
        });
    },
    function(err) {
        // if the user search fails report an error
        console.log("error looking up user", err);
        reject("User not found");
    });
};

module.exports = { getUser, getAllUsers, add, updatePassword, remove };