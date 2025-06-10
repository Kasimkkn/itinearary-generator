const User = require('../models/User');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, isCreatedByAdmin } = req.body;

        if (!name || !email || !password) {
            return res.status(200).json({ success: false, message: 'Please provide name, email, and password' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(200).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role && req.user && req.user.role === 'admin' ? role : 'user',
            isVerified: !!isCreatedByAdmin
        });

        if (!isCreatedByAdmin) {
            await sendVerificationEmail(user);
            return res.status(201).json({
                success: true,
                message: 'User registered. Please check your email to verify your account.',
            });
        } else {
            const token = user.generateAuthToken();
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                    token
                }
            });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: error.message
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(200).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isVerified) {
            return res.status(200).json({
                success: false,
                message: 'Please verify your account before logging in'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(200).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = user.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login',
            error: error.message
        });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { token } = req.params;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token or user not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'User is already verified' });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in.',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
        await sendResetPasswordEmail(user, token);

        res.status(200).json({ message: 'Password reset link sent to your email' });

    } catch (err) {
        console.error('Error in forgotPassword:', err);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Find user and include the password field explicitly
        const user = await User.findById(decoded.id).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the new password is different from the old one
        const isSamePassword = await user.comparePassword(password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from the old one' });
        }

        // Assign the new password and save (pre-save hook will handle hashing)
        user.password = password;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });

    } catch (err) {
        console.error('Error in reset-password:', err);
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = req.params.id;

        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this user'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        // Save user
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this user'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

exports.getSingleUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user is authorized (admin or the user themselves)
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this user data'
            });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message
        });
    }
};