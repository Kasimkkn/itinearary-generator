// models/Itinerary.js (updated)
const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    activity: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    meal_suggestions: {
        type: [String],
        default: []
    },
    estimated_cost: {
        type: String,  // Changed from Number to String to accept values like "€250 per person"
        required: true
    },
    additional_notes: {
        type: String,
        default: ''
    }
});

const itinerarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Now required since we have user authentication
    },
    departure_city: {
        type: String,
        required: true
    },
    arrival_city: {
        type: String,
        required: true
    },
    departure_date: {
        type: String,
        required: true
    },
    arrival_date: {
        type: String,
        required: true
    },
    travelers: {
        adults: {
            type: Number,
            required: true
        },
        children: {
            type: Number,
            default: 0
        },
        infants: {
            type: Number,
            default: 0
        }
    },
    budget_type: {
        type: String,
        enum: ['Budget', 'Moderate', 'Luxury'],
        required: true
    },
    itinerary: {
        type: [itineraryDaySchema],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);