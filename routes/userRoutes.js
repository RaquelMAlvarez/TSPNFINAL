const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// User management and authentication route
router.get('/', userController.showUsersPage);
router.get('/showLogin', userController.showLogin)
router.post('/login', userController.login)
router.get('/logout', userController.logout)
router.get('/showRegister', userController.showRegister)
router.post('/register', userController.register)
router.post('/changePassword', userController.changePassword)
router.get('/showChangePassword', userController.showChangePassword)
router.delete('/:username', userController.deleteUserPage)

module.exports = router;
