const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const ProviderProfile = require('../models/providerModel');
const Service = require('../models/ServiceModel');
const authMiddleware = require('../middleware/authMiddleware');
const { Op, fn, col, where } = require('sequelize');

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

// Selected service aur user city ke hisaab se approved providers fetch karo
router.get('/providers', authMiddleware, async (req, res) => {
    try {
        const category = (req.query.category || '').trim().toLowerCase();
        const categoryFirstWord = category.split(/\s+/)[0];
        const categoryMatches = [...new Set([category, categoryFirstWord].filter(Boolean))];
        const city = (req.query.city || '').trim().toLowerCase();

        if (!category || !city || city === 'undefined' || city === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Category aur city required hai'
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

        const providers = await ProviderProfile.findAll({
            where: {
                status: 'approved',
                [Op.and]: [
                    where(fn('LOWER', fn('TRIM', col('category'))), { [Op.in]: categoryMatches })
                ]
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'email', 'city', 'state'],
                where: where(fn('LOWER', fn('TRIM', col('user.city'))), city)
            }],
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

module.exports = router;
