const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Add logging middleware
router.use((req, res, next) => {
    console.log('Auth route:', req.method, req.url);
    next();
});

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router; 