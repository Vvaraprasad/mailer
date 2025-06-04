const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Utility function to send OTP via email
console.log('Email:', process.env.ADMIN_EMAIL);
console.log(
  'Password:',
  process.env.ADMIN_EMAIL_PASS ? 'Loaded' : 'Not Loaded'
);

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    throw new Error('Failed to send OTP email');
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();

    const newUser = new User({ name, email, password: hashedPassword, otp });
    await newUser.save();

    await sendOtpEmail(email, otp);

    res.status(201).json({ message: 'OTP sent to your email. Please verify.' });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Login user and send OTP
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({
      message: 'OTP sent to your email. Please verify.',
      userId: user._id,
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    console.log(token)
    console.log("logged successfully")
    res.json({ token, user });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
