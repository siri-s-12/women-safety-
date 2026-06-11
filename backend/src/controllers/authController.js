const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Guardian = require('../models/Guardian');
const { logActivity } = require('./activityController');

const generateToken = (userId, email) => {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (req, res, next) => {
    try {
        const { 
            fullName, 
            email, 
            phone, 
            password, 
            confirmPassword, 
            termsAccepted,
            emergencyContactName, 
            emergencyContactPhone, 
            emergencyContactRelationship 
        } = req.body;

        // Step 1: Validation
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 10 digits'
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least one uppercase, one lowercase, one number, and one special character'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Terms of Service validation
        if (!termsAccepted) {
            return res.status(400).json({
                success: false,
                message: 'You must accept the Terms of Service and Privacy Policy'
            });
        }

        // Check if database is enabled
        const isDBEnabled = String(process.env.ENABLE_DB || '').toLowerCase() === 'true';

        if (isDBEnabled) {
            // Database mode: Save to MongoDB
            try {
                const user = new User({
                    fullName,
                    email,
                    phone,
                    password,
                    termsAcceptedAt: new Date()
                });

                await user.save();

                const token = generateToken(user._id, user.email);

                const responseData = {
                    token: token,
                    user: {
                        userId: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        phone: user.phone
                    }
                };

                if (emergencyContactName && emergencyContactPhone) {
                    responseData.guardian = {
                        guardianName: emergencyContactName,
                        guardianPhone: emergencyContactPhone,
                        relationship: emergencyContactRelationship || 'Other'
                    };
                }

                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: responseData
                });
            } catch (dbError) {
                next(dbError);
            }
        } else {
            // Development mode: Instant mock registration
            const mockToken = 'mock-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const mockUserId = 'mock-user-' + email.split('@')[0] + '-' + Date.now();
            
            const responseData = {
                token: mockToken,
                user: {
                    userId: mockUserId,
                    fullName: fullName,
                    email: email,
                    phone: phone
                }
            };

            if (emergencyContactName && emergencyContactPhone) {
                responseData.guardian = {
                    guardianId: 'mock-guardian-' + Date.now(),
                    guardianName: emergencyContactName,
                    guardianPhone: emergencyContactPhone,
                    relationship: emergencyContactRelationship || 'Other'
                };
            }

            res.status(201).json({
                success: true,
                message: 'User registered successfully (Development Mode)',
                data: responseData
            });
        }
    } catch (err) {
        next(err);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400);
            throw new Error('Please enter a valid email address');
        }

        // Password length validation
        if (password.length < 6) {
            res.status(400);
            throw new Error('Password must be at least 6 characters');
        }

        // Check if database is enabled
        const isDBEnabled = String(process.env.ENABLE_DB || '').toLowerCase() === 'true';

        if (isDBEnabled) {
            // Database mode: Authenticate with MongoDB
            try {
                const user = await User.findOne({ email });
                if (!user || !user.isActive) {
                    res.status(401);
                    throw new Error('Invalid credentials');
                }

                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    res.status(401);
                    throw new Error('Invalid credentials');
                }

                user.lastLogin = new Date();
                await user.save();

                const token = generateToken(user._id, user.email);

                await logActivity(user._id, 'login', { ip: req.ip });

                res.status(200).json({
                    success: true,
                    message: 'Logged in successfully',
                    data: { token, user }
                });
            } catch (dbError) {
                next(dbError);
            }
        } else {
            // Development mode: Instant mock authentication
            // Accept any valid email and password (6+ characters)
            const mockToken = 'mock-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const fullName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
            const mockUser = {
                userId: 'mock-user-' + email.split('@')[0] + '-' + Date.now(),
                fullName: fullName,
                email: email,
                phone: '9876543210'
            };
            
            res.status(200).json({
                success: true,
                message: 'Logged in successfully (Development Mode)',
                data: { token: mockToken, user: mockUser }
            });
        }
    } catch (err) {
        next(err);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        await logActivity(req.user.userId, 'logout', {});
        res.status(200).json({ success: true, message: 'Logged out successfully', data: {} });
    } catch (err) {
        next(err);
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
        // Check if database is enabled
        const isDBEnabled = String(process.env.ENABLE_DB || '').toLowerCase() === 'true';

        if (isDBEnabled) {
            // Database mode: Get user from MongoDB
            const user = await User.findById(req.user.userId);
            if (!user) {
                res.status(404);
                throw new Error('User not found');
            }
            res.status(200).json({ success: true, message: 'User fetched', data: user });
        } else {
            // Development mode: Return mock user instantly
            const mockUser = {
                userId: req.user.userId,
                fullName: req.user.email.split('@')[0].charAt(0).toUpperCase() + req.user.email.split('@')[0].slice(1),
                email: req.user.email,
                phone: '9876543210'
            };
            res.status(200).json({ success: true, message: 'User fetched (Development Mode)', data: mockUser });
        }
    } catch (err) {
        next(err);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const token = generateToken(req.user.userId, req.user.email);
        res.status(200).json({ success: true, message: 'Token refreshed', data: { token } });
    } catch (err) {
        next(err);
    }
};

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser, refreshToken };
