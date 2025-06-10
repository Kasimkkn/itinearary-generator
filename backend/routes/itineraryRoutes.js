const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');

// Create a new itinerary
router.post('/', protect, itineraryController.createItinerary);

// Get all itineraries (with optional filtering)
router.get('/', protect, itineraryController.getItineraries);

// Get a single itinerary by ID
router.get('/:id', protect, itineraryController.getItineraryById);

// Delete an itinerary
router.delete('/:id', protect, itineraryController.deleteItinerary);

module.exports = router;