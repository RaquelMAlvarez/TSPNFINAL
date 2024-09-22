const messageModel = require('../models/message');

function showContactPage(req, res) {
    res.render('contact');
};

function addMessage(req, res) {
    console.log("Adding message: ", req.body);
    messageModel.addMessage(req.body).then(() => {   
        res.render("contact", { message: "Your message was successfully sent" });
    })
    .catch((err) => {
        res.render("contact", { message: err });
    });
};



module.exports = { showContactPage, addMessage };
