const nedb = require("nedb");

const messageDb = new nedb({ filename: "data/message.db", autoload: true });
console.log("message db loaded");


function getById(id) {
    return new Promise((resolve, reject) => {
        console.log("Looking up message with id: ", id);

        messageDb.find({'_id': id}, function (err, foundMessage) {
            if (err) {
                console.log("error finding message with id", id, ": ", err);
                reject(err);
            } else if (foundMessage.length == 0) {
                console.log("message with id", id, "not found");
                resolve(null);
            } else {
                const foundMessageItem = foundMessage[0];
                console.log("found message: ", foundMessageItem);
                resolve(foundMessageItem);
            };
        });
    });
};

function getAllMessages() {
    return new Promise((resolve, reject) => {
        messageDb.find({}, function(err, messages) {
            if (err) {
                console.log("Error loading messages", err);
                reject(err);
            } else {
                console.log("Messages loaded", messages);
                resolve(messages);
            };
        });
    });
};

function addMessage(message) {
    var message = {
        title: message.title,
        content: message.content
    };
    
    return new Promise((resolve, reject) => {
        console.log("Adding message: ", message);

        // if the title or content is missing, report an error
        if (!message.title || message.title == "") return reject("Missing title");
        if (!message.content || message.content == "") return reject("Missing content");

        // insert message into the database
        messageDb.insert(message, function(err, newMessage) {
            if (err) {
                console.log("Error inserting message", message);
                reject(err);
            } else {
                console.log("message inserted into database", newMessage);  
                resolve(newMessage);
            };
        });
    });
};

function remove(id) {
    return new Promise((resolve, reject) => {
        // find the message we want to delete in the database
        getById(id).then(function(currentMessage) {
            // if the message is not found report an error
            if (!currentMessage) {
                console.log("message with id", id, "not found");
                reject("message with id", id, "not found");
            } else {
                //delete the message
                console.log("Deleting message with id: ", id);  
                messageDb.remove({ _id: id }, {}, function(err, numberDeleted) {
                    if (err) {
                        console.log("Error deleting message with id:", id);
                        reject(err);
                    } else {
                        console.log("Deleted", numberDeleted, "Message in database"); 
                        messageDb.loadDatabase();
                        resolve(numberDeleted);
                    };
                });
            };
        });
    },
    function(err) {
        // if the message search fails report an error
        console.log("error looking up message", err);
        reject("message not found");
    });
};

module.exports = { addMessage , getAllMessages , remove, getById }