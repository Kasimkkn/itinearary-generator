const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/login', userController.loginUser);
router.post('/create', userController.registerUser);
router.get('/verify/:token', userController.verifyUser);


router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);



router.get('/me', protect, userController.getCurrentUser);
router.get('/:id', protect, userController.getSingleUser);

router.get('/', protect, isAdmin, userController.getAllUsers);
router.put('/:id', protect, isAdmin, userController.updateUser);
router.delete('/:id', protect, isAdmin, userController.deleteUser);

module.exports = router;