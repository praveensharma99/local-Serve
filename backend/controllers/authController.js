const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const Otp = require('../models/OtpModel');
const { sendEmail } = require('../utils/email');
const { otpEmailTemplate } = require('../utils/emailTemplates');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtp = async (req, res) => {
  const { name, email } = req.body;
  console.log('[sendOtp] Request received for email:', email);
  try {
    const existingUser = await User.findOne({ where: { email } });
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
  const { name, email, password, role, city, state, otp } = req.body;
  try {
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required!' });
    }

    const existingUser = await User.findOne({ where: { email } });
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
      role: role || 'user',
      city,
      state,
    });

    await Otp.destroy({ where: { id: otpRecord.id } });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Wrong password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city, state: user.state } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

module.exports = { sendOtp, register, login };