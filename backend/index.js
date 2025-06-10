
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const itineraryRoutes = require('./routes/itineraryRoutes');
const userRoutes = require('./routes/userRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { validateApiKey } = require('./middleware/auth');
const User = require('./models/User');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/itinerary-planner')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/apikeys', apiKeyRoutes);
app.use('/api/itineraries', validateApiKey, itineraryRoutes);

app.use(errorHandler);

async function checkAdminUser() {
    try {
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            const newAdminUser = new User({
                email: 'admin@gmail.com',
                password: 'admin123',
                name: 'Admin',
                role: 'admin',
                isVerified: true,
            })
            await newAdminUser.save();
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.log('Error checking admin user:', error);
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    checkAdminUser();
});