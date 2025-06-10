const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { protect, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Create a new API key
router.post('/', apiKeyController.createApiKey);

// Get user's API keys
router.get('/', apiKeyController.getUserApiKeys);

// Get all API keys (admin only)
router.get('/all', isAdmin, apiKeyController.getAllApiKeys);

// Activate/deactivate API key
router.put('/:id/activate', apiKeyController.activateApiKey);
router.put('/:id/deactivate', apiKeyController.deactivateApiKey);

// Delete API key
router.delete('/:id', apiKeyController.deleteApiKey);

module.exports = router;