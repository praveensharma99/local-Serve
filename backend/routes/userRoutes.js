const express = require('express');
const router = express.Router();
const { User, ProviderProfile, Service, Payment, Booking } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { Op, fn, col, where } = require('sequelize');

// Public route to get all active services for home page
router.get('/services', async (req, res) => {
    try {
        const services = await Service.findAll({
            where: {
                [Op.or]: [{ isActive: true }, { isActive: null }]
            },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// User ki profile fetch karne ka route
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // req.user.id authMiddleware se decode hoke milta hai
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'role', 'city', 'state', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User nahi mila" });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Selected service ke hisaab se approved providers fetch karo, city optional hai
router.get('/providers', async (req, res) => {
    try {
        const category = (req.query.category || '').trim().toLowerCase();
        const categoryFirstWord = category.split(/\s+/)[0];
        const categoryMatches = [...new Set([category, categoryFirstWord].filter(Boolean))];
        const city = (req.query.city || '').trim().toLowerCase();

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category required hai'
            });
        }

        // Check if requested service category is active
        const activeService = await Service.findOne({
            where: {
                [Op.or]: [
                    where(fn('LOWER', fn('TRIM', col('name'))), category),
                    where(fn('LOWER', fn('TRIM', col('name'))), categoryFirstWord)
                ],
                [Op.or]: [{ isActive: true }, { isActive: null }]
            }
        });

        if (!activeService) {
            return res.json({ success: true, providers: [] });
        }

        const userInclude = {
            model: User,
            as: 'user',
            attributes: ['name', 'email', 'city', 'state']
        };

        if (city && city !== 'undefined' && city !== 'null') {
            userInclude.where = where(fn('LOWER', fn('TRIM', col('user.city'))), city);
        }

        const providers = await ProviderProfile.findAll({
            where: {
                status: 'approved',
                [Op.and]: [
                    where(fn('LOWER', fn('TRIM', col('category'))), { [Op.in]: categoryMatches })
                ]
            },
            include: [userInclude],
            order: [['updatedAt', 'DESC']]
        });

        res.json({ success: true, providers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// User profile update route
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email, city, state } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) user.name = name.trim();
        if (email) user.email = email.trim().toLowerCase();
        if (city !== undefined) user.city = city.trim();
        if (state !== undefined) user.state = state.trim();

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                city: user.city,
                state: user.state,
                role: user.role,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET api/user/payments/history
// @desc    Get user's payment history
router.get('/payments/history', authMiddleware, async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { userId: req.user.id },
            include: [
                { model: ProviderProfile, as: 'provider', include: [{ model: User, as: 'user', attributes: ['name'] }] },
                { model: Booking, as: 'booking', attributes: ['serviceCategory', 'bookingDate', 'status'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
