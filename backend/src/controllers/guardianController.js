const Guardian = require('../models/Guardian');

const isDBEnabled = String(process.env.ENABLE_DB || '').toLowerCase() === 'true';
const mockGuardianStore = {};

const normalizePhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
};

const getSavedGuardians = (userId) => {
    if (!mockGuardianStore[userId]) {
        mockGuardianStore[userId] = [];
    }
    return mockGuardianStore[userId];
};

const addGuardian = async (req, res, next) => {
    try {
        const { guardianName, guardianPhone, relationship } = req.body;
        
        // Input validation
        if (!guardianName || !guardianPhone || !relationship) {
            return res.status(400).json({
                success: false,
                message: 'Guardian name, phone, and relationship are required'
            });
        }

        // Name validation
        if (guardianName.length < 2 || guardianName.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Guardian name must be between 2 and 50 characters'
            });
        }

        // Phone validation
        const normalizedPhone = normalizePhone(guardianPhone);
        if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be between 10 and 15 digits'
            });
        }

        // Relationship validation
        const validRelationships = ['Mom', 'Dad', 'Sister', 'Brother', 'Friend', 'Partner', 'Spouse', 'Guardian', 'Other'];
        if (!validRelationships.includes(relationship)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid relationship type'
            });
        }

        const userId = req.user.userId;

        if (isDBEnabled) {
            const existingGuardian = await Guardian.findOne({ 
                userId, 
                guardianPhone: normalizedPhone 
            });
            
            if (existingGuardian) {
                return res.status(400).json({
                    success: false,
                    message: 'Guardian already added'
                });
            }

            const guardian = await Guardian.create({
                userId,
                guardianName,
                guardianPhone: normalizedPhone,
                relationship,
                status: 'active',
                addedAt: Date.now(),
                isVerified: false
            });

            return res.status(201).json({ 
                success: true, 
                message: 'Guardian added successfully', 
                data: guardian 
            });
        }

        const guardians = getSavedGuardians(userId);
        const existingGuardian = guardians.find(g => g.guardianPhone === normalizedPhone);
        if (existingGuardian) {
            return res.status(400).json({
                success: false,
                message: 'Guardian already added'
            });
        }

        const guardian = {
            _id: `${userId}-${Date.now()}`,
            userId,
            guardianName,
            guardianPhone: normalizedPhone,
            relationship,
            status: 'active',
            addedAt: new Date(),
            isVerified: false
        };
        guardians.push(guardian);

        res.status(201).json({ 
            success: true, 
            message: 'Guardian added successfully', 
            data: guardian 
        });
    } catch (err) {
        next(err);
    }
};

const getGuardians = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        if (isDBEnabled) {
            const guardians = await Guardian.find({ userId, status: 'active' });
            return res.status(200).json({ 
                success: true, 
                message: 'Guardians retrieved successfully', 
                data: guardians 
            });
        }

        const guardians = getSavedGuardians(userId).filter(g => g.status === 'active');
        res.status(200).json({ 
            success: true, 
            message: 'Guardians retrieved successfully (Development Mode)', 
            data: guardians 
        });
    } catch (err) {
        next(err);
    }
};

const removeGuardian = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (isDBEnabled) {
            const guardian = await Guardian.findOne({ _id: id, userId });
            if (!guardian) {
                return res.status(404).json({
                    success: false,
                    message: 'Guardian not found'
                });
            }

            guardian.status = 'inactive';
            await guardian.save();

            return res.status(200).json({ 
                success: true, 
                message: 'Guardian removed successfully', 
                data: {} 
            });
        }

        const guardians = getSavedGuardians(userId);
        const guardian = guardians.find(g => g._id === id);
        if (!guardian) {
            return res.status(404).json({
                success: false,
                message: 'Guardian not found'
            });
        }

        guardian.status = 'inactive';
        res.status(200).json({ 
            success: true, 
            message: 'Guardian removed successfully', 
            data: {} 
        });
    } catch (err) {
        next(err);
    }
};

const updateGuardian = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { guardianName, guardianPhone, relationship } = req.body;
        const userId = req.user.userId;

        let guardian;

        if (isDBEnabled) {
            guardian = await Guardian.findOne({ _id: id, userId });
        } else {
            const guardians = getSavedGuardians(userId);
            guardian = guardians.find(g => g._id === id);
        }

        if (!guardian) {
            return res.status(404).json({
                success: false,
                message: 'Guardian not found'
            });
        }

        if (guardianName) {
            if (guardianName.length < 2 || guardianName.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Guardian name must be between 2 and 50 characters'
                });
            }
            guardian.guardianName = guardianName;
        }

        if (guardianPhone) {
            const normalizedPhone = normalizePhone(guardianPhone);
            if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must be between 10 and 15 digits'
                });
            }
            guardian.guardianPhone = normalizedPhone;
        }

        if (relationship) {
            const validRelationships = ['Mom', 'Dad', 'Sister', 'Brother', 'Friend', 'Partner', 'Spouse', 'Guardian', 'Other'];
            if (!validRelationships.includes(relationship)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid relationship type'
                });
            }
            guardian.relationship = relationship;
        }

        if (isDBEnabled) {
            await guardian.save();
        }

        res.status(200).json({ 
            success: true, 
            message: 'Guardian updated successfully', 
            data: guardian 
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { addGuardian, getGuardians, removeGuardian, updateGuardian };
