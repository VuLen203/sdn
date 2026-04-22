const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// POST /users/register (not in Postman spec, but needed by frontend)
router.post('/register', userController.register);

// POST /users/login
router.post('/login', userController.login);

// GET /users/  (protected)
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);

module.exports = router;
