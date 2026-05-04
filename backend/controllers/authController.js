const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { fn, col, where } = require('sequelize');
const User = require('../models/UserModel');
const ProviderProfile = require('../models/providerModel');
const Otp = require('../models/OtpModel');
const { sendEmail } = require('../utils/email');
const { otpEmailTemplate } = require('../utils/emailTemplates');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeRole(role) {
  const normalized = String(role || 'user').trim().toLowerCase();
  return ['user', 'provider', 'admin'].includes(normalized) ? normalized : 'user';
}

function emailWhere(email) {
  return where(fn('LOWER', fn('TRIM', col('email'))), normalizeEmail(email));
}

const sendOtp = async (req, res) => {
  const { name } = req.body;
  const email = normalizeEmail(req.body.email);
  console.log('[sendOtp] Request received for email:', email);
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required!' });
    }

    const existingUser = await User.findOne({ where: emailWhere(email) });
    if (existingUser) {
      console.log('[sendOtp] Email already exists:', email);
      return res.status(400).json({ success: false, message: 'Email already exists!' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log('[sendOtp] Generated OTP:', otp, 'for email:', email);

    await Otp.destroy({ where: { email, type: 'register' } });
    await Otp.create({ email, otp, type: 'register', expiresAt });
    console.log('[sendOtp] OTP saved to DB');

    console.log('[sendOtp] Attempting to send email to:', email);
    await sendEmail({
      to: email,
      subject: 'Your LocalServe Verification Code',
      html: otpEmailTemplate({ name: name || 'User', otp }),
      text: `Your LocalServe OTP is: ${otp}. Valid for 10 minutes.`,
    });
    console.log('[sendOtp] Email sent successfully');

    res.json({ success: true, message: 'OTP sent to your email!' });
  } catch (err) {
    console.error('[sendOtp] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP: ' + err.message });
  }
};

const register = async (req, res) => {
  const { password, otp } = req.body;
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const role = normalizeRole(req.body.role);
  const city = String(req.body.city || '').trim();
  const state = String(req.body.state || '').trim();
  try {
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required!' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required!' });
    }

    const existingUser = await User.findOne({ where: emailWhere(email) });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists!' });
    }

    const otpRecord = await Otp.findOne({
      where: { email, type: 'register', otp },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP!' });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ success: false, message: 'OTP has expired!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      city,
      state,
    });

    await Otp.destroy({ where: { id: otpRecord.id } });

    const normalizedRole = normalizeRole(user.role);
    const token = jwt.sign(
      { id: user.id, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const needsOnboarding = normalizedRole === 'provider';

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
        city: user.city,
        state: user.state,
        needsOnboarding,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: emailWhere(email) });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Check if account is deleted/inactive
    if (user.isActive === false) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }

    const normalizedRole = normalizeRole(user.role);
    let needsOnboarding = false;
    if (normalizedRole === 'provider') {
      const providerProfile = await ProviderProfile.findOne({ where: { userId: user.id } });
      needsOnboarding = !providerProfile;
    }

    const token = jwt.sign(
      { id: user.id, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
        city: user.city,
        state: user.state,
        needsOnboarding,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

module.exports = { sendOtp, register, login };
