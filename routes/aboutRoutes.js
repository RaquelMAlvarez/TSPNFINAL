const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');

// About page route
router.get('/', aboutController.showAboutPage); 

module.exports = router;

