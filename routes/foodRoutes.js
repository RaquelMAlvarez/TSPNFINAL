const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

// Food page route
router.get('/', foodController.showFoodPage);
router.get('/showAdd', foodController.showAddFoodPage);
router.post('/add', foodController.addFoodPage);
router.delete('/:id', foodController.claimFood);

module.exports = router;


