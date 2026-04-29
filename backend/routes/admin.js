const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const ProviderProfile = require('../models/providerModel');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// 1. DASHBOARD STATS
router.get('/dashboard-stats', authMiddleware, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count({ where: { role: 'user' } });
        const activeProviders = await ProviderProfile.count({ where: { status: 'approved' } });
        const pendingProviders = await ProviderProfile.count({ where: { status: 'pending' } });

        const pendingQueue = await ProviderProfile.findAll({
            where: { status: 'pending' },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'email', 'createdAt', 'city', 'state']
            }],
            order: [['id', 'DESC']]
        });

        res.json({
            success: true,
            stats: {
                users: totalUsers,
                providers: activeProviders,
                pending: pendingProviders,
                revenue: "2.4L"
            },
            pendingQueue: pendingQueue.map(p => ({
                id: p.id,
                name: p.user?.name,
                email: p.user?.email,
                city: p.user?.city,
                state: p.user?.state,
                category: p.category,
                price_per_hour: p.pricePerHour || p.price_per_hour,
                aadhar_pdf_url: p.aadharPdfUrl || p.aadhar_pdf_url,
                profile_pic_url: p.profilePicUrl || p.profile_pic_url,
                created_at: p.user?.createdAt
            }))
        });
    } catch (err) {
        console.error("🔥 ASLI ERROR:", err.message);
        res.status(500).json({ success: false, message: "Sequelize Error: " + err.message });
    }
});

// 2. GET ALL NORMAL USERS
router.get('/all-users', authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: 'user' },
            attributes: ['id', 'name', 'email', 'createdAt', 'city', 'state'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error: Users fetch nahi ho paye' });
    }
});

// 3. DELETE USER
router.delete('/delete-user/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await User.destroy({
            where: { id: id, role: 'user' }
        });
        if (result) {
            res.json({ success: true, message: "User successfully deleted!" });
        } else {
            res.status(404).json({ success: false, message: "User nahi mila!" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete fail ho gaya" });
    }
});

// 4. GET ALL APPROVED PROVIDERS
router.get('/approved-providers', authMiddleware, isAdmin, async (req, res) => {
    try {
        const providers = await ProviderProfile.findAll({
            where: { status: 'approved' },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'email', 'city', 'state']
            }],
            order: [['updatedAt', 'DESC']]
        });
        const normalizedProviders = providers.map((provider) => {
            const plainProvider = provider.get({ plain: true });

            return {
                ...plainProvider,
                User: plainProvider.user || null,
            };
        });

        res.json({ success: true, providers: normalizedProviders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. REMOVE PROVIDER
router.delete('/delete-provider/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await ProviderProfile.destroy({ where: { id } });
        res.json({ success: true, message: "Provider removed!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 6. APPROVE PROVIDER
router.put('/approve-provider/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await ProviderProfile.update({ status: 'approved' }, { where: { id } });
        res.json({ success: true, message: "Provider Verified Successfully! ✅" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 7. REJECT PROVIDER
router.put('/reject-provider/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await ProviderProfile.update({ status: 'rejected' }, { where: { id } });
        res.json({ success: true, message: "Provider Rejected! ❌" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// 1. GET ALL SERVICES (Fetch List)
router.get('/get-services', authMiddleware, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const showAll = req.query.all === 'true';
    const where = showAll ? {} : { [Op.or]: [{ isActive: true }, { isActive: null }] };
    const services = await Service.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Add service
const Service = require('../models/ServiceModel');
const Booking = require('../models/BookingModel');

// Admin Booking Stats (for charts)
router.get('/booking-stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');

    const totalBookings = await Booking.count();

    const statusCounts = {
      pending: await Booking.count({ where: { status: 'pending' } }),
      accepted: await Booking.count({ where: { status: 'accepted' } }),
      rejected: await Booking.count({ where: { status: 'rejected' } }),
      completed: await Booking.count({ where: { status: 'completed' } }),
    };

    const codCount = await Booking.count({ where: { paymentMode: 'COD' } });
    const onlineCount = await Booking.count({ where: { paymentMode: 'Online' } });

    // Last 6 months booking counts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); sixMonthsAgo.setHours(0,0,0,0);

    const monthlyRaw = await Booking.findAll({
      where: { createdAt: { [Sequelize.Op.gte]: sixMonthsAgo } },
      attributes: [
        [Sequelize.fn('TO_CHAR', Sequelize.col('createdAt'), 'Mon'), 'month'],
        [Sequelize.fn('TO_CHAR', Sequelize.col('createdAt'), 'YYYY-MM'), 'sortKey'],
        [Sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [
        Sequelize.fn('TO_CHAR', Sequelize.col('createdAt'), 'Mon'),
        Sequelize.fn('TO_CHAR', Sequelize.col('createdAt'), 'YYYY-MM')
      ],
      order: [[Sequelize.fn('TO_CHAR', Sequelize.col('createdAt'), 'YYYY-MM'), 'ASC']],
      raw: true
    });

    const monthlyBookings = monthlyRaw.map(r => ({ month: r.month, count: Number(r.count) }));

    res.json({
      success: true,
      totalBookings,
      statusCounts,
      paymentDistribution: { COD: codCount, Online: onlineCount },
      monthlyBookings
    });
  } catch (err) {
    console.error('Booking stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all bookings across platform
router.get('/all-bookings', authMiddleware, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'customer', attributes: ['name', 'email'] },
        { model: ProviderProfile, as: 'provider', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    const normalizedBookings = bookings.map((booking) => {
      const plainBooking = booking.get({ plain: true });

      return {
        ...plainBooking,
        provider: plainBooking.provider
          ? {
              ...plainBooking.provider,
              User: plainBooking.provider.user || null,
            }
          : null,
      };
    });

    res.json({ success: true, bookings: normalizedBookings });
  } catch (err) {
    console.error('All bookings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Route: Nayi service add karne ke liye
router.post('/add-service', async (req, res) => {
  try {
    const { name, description, icon, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Service name is required!" });
    }

    const newService = await Service.create({
      name,
      description: description?.trim() || null,
      icon,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: "Service Category added successfully!",
      data: newService
    });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/toggle-service/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Admin] Toggle service request for ID: ${id}`);
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found!" });
    }
    console.log(`[Admin] Service found: ${service.name}, current isActive: ${service.isActive}`);
    service.isActive = !service.isActive;
    await service.save();
    console.log(`[Admin] Service toggled to: ${service.isActive}`);
    res.json({ success: true, message: `Service ${service.isActive ? 'activated' : 'deactivated'}!`, service });
  } catch (err) {
    console.error("[Admin] Toggle service error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/delete-service/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await Service.destroy({ where: { id } });
    res.json({ success: true, message: "Service deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// 📢 SIRF EK BAAR EXPORT KARNA HAI FILE KE END MEIN
module.exports = router;
