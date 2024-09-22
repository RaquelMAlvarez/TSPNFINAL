const authController = require('./authController');
const messageModel = require('../models/message');

function viewMessage(_, res) {
    const messages = messageModel.getAllMessages();
    messages.then((message_items) => {
            res.render("message", {
                message: message_items
        })})
        .catch((err) => {
            console.log("promise rejected", err);
        });
};

function showMessagePage(req, res) {
    // validate if user has access to view message
    authController.requireAdminAccess(req, res, "view message", viewMessage);
};

function deleteMessage(req, res) {
    // parse id from request
    const id = req.params.id
    if (!id) {
        console.log("Missing id parameter");
        res.status(400).send("Please specify the id parameter");
        return;
    };

    // find the message we want to delete in the database
    messageModel.getById(id).then(function (currentMessage) {
        console.log("Current message:", currentMessage);

        // if the message is not found report an error
        if (!currentMessage) {
            console.log("Message with id", id, "not found");
            res.status(404).send("Message with id", id, "not found");
            return;
        };

        // delete the message in database
        messageModel.remove(id).then(function(_) {
            console.log("Message with id", id, "was deleted"); 
            res.status(204).send("Message with id", id, "was deleted");
        },
        function(err) {
            console.log("failed to delete message with id", id, "with error:", err);
        });
    },
    function(err) {
        console.log("Falied to find message with id", id, "with error:", err);
    });
};


module.exports = { showMessagePage , deleteMessage };