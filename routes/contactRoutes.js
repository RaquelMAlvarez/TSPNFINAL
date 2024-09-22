const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Contact page route
router.get('/', contactController.showContactPage); 
router.post('/sendMessage', contactController.addMessage);

module.exports = router;