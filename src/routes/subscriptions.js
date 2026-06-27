const express = require('express');
const router = express.Router();
const { getUserSubscription, getMySubscription } = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth'); // Middleware de auth

router.get('/user/:userId', getUserSubscription);

router.get('/me', authMiddleware, getMySubscription);

module.exports = router;
