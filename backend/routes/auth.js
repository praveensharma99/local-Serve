const express = require('express');
const router = express.Router();
const { sendOtp, register, login } = require('../controllers/authController');
const { completeOnboarding } = require('../controllers/providerController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);

router.post('/onboarding', 
    authMiddleware, 
    upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'aadharFile', maxCount: 1 }]), 
    completeOnboarding
);

module.exports = router;