const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// message page route
router.get('/', messageController.showMessagePage); 
router.delete('/:id', messageController.deleteMessage);

module.exports = router;