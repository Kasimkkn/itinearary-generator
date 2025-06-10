
const Itinerary = require('../models/Itinerary');

exports.createItinerary = async (req, res) => {
    try {
        const itineraryData = req.body;

        itineraryData.userId = req.userId;

        const itinerary = await Itinerary.create(itineraryData);

        res.status(201).json({
            success: true,
            message: 'Itinerary saved successfully',
            data: itinerary
        });
    } catch (error) {
        console.error('Error saving itinerary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save itinerary',
            error: error.message
        });
    }
};


exports.getItineraries = async (req, res) => {
    try {
        const { departure_city, arrival_city } = req.query;

        const filter = { userId: req.userId };

        if (departure_city) filter.departure_city = departure_city;
        if (arrival_city) filter.arrival_city = arrival_city;

        const itineraries = await Itinerary.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: itineraries.length,
            data: itineraries
        });
    } catch (error) {
        console.error('Error fetching itineraries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch itineraries',
            error: error.message
        });
    }
};

exports.getItineraryById = async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            return res.status(404).json({
                success: false,
                message: 'Itinerary not found'
            });
        }

        res.status(200).json({
            success: true,
            data: itinerary
        });
    } catch (error) {
        console.error('Error fetching itinerary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch itinerary',
            error: error.message
        });
    }
};

exports.deleteItinerary = async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            return res.status(404).json({
                success: false,
                message: 'Itinerary not found'
            });
        }

        await itinerary.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Itinerary deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting itinerary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete itinerary',
            error: error.message
        });
    }
};