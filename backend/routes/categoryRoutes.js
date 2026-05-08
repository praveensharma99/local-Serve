const express = require('express');
const router = express.Router();
const Service = require('../models/ServiceModel');
const { Op } = require('sequelize');

// API to fetch active categories for the footer
router.get('/footer', async (req, res) => {
    try {
        const services = await Service.findAll({
            where: {
                [Op.or]: [{ isActive: true }, { isActive: null }]
            },
            order: [['createdAt', 'DESC']] // Most recent first, or order by name
        });
        
        // Format to match requested structure
        const formattedCategories = services.map(s => ({
            name: s.name,
            slug: s.name.toLowerCase().replace(/\s+/g, '-'),
            status: s.isActive === false ? 'inactive' : 'active'
        }));
        
        res.json({ success: true, categories: formattedCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
