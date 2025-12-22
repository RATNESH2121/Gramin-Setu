const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, village, district, adminSecret, otp } = req.body;

        // Verify OTP
        // Verify OTP (Email Based)
        const storedData = otpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ message: 'Please verify email with OTP first' });
        }
        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        otpStore.delete(email); // Clear OTP on success

        // Check user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user with plain text password
        user = new User({
            name,
            email,
            phone,
            password, // Storing plain text password
            role: req.body.adminSecret === 'admin123' ? 'admin' : 'farmer',
            village: req.body.village,
            district: req.body.district,
        });

        await user.save();

        // Return dummy token
        const token = 'dummy_token_' + user.id;
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                village: user.village,
                district: user.district
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Compare plain text password
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Return dummy token
        const token = 'dummy_token_' + user.id;
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                village: user.village,
                district: user.district
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// In-memory OTP Store (Production should use Redis)
const otpStore = new Map();
const axios = require('axios');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { phone, isRegister, email } = req.body;

        let user = null;
        if (isRegister) {
            // Check if email already exists
            user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'Email already registered' });
            }
        } else {
            user = await User.findOne({ phone });
            // Login: User must exist
            if (!user) {
                return res.status(404).json({ message: 'Phone number not registered' });
            }
        }

        // Determine Email to send to
        const targetEmail = isRegister ? email : (user ? user.email : null);

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        let sentMethod = 'console';

        // 3. Send via Email (Priority)
        if (targetEmail) {
            try {
                const actionType = isRegister ? 'Registration' : 'Login';
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: targetEmail,
                    subject: `GraminSetu ${actionType} OTP`,
                    text: `GraminSetu ${actionType} OTP: ${otp}.\nValid for 5 minutes.\nDo not share this OTP with anyone.`
                });
                console.log(`[DEBUG] OTP sent to Email: ${targetEmail}`);
                sentMethod = 'email';
            } catch (emailErr) {
                console.error("Email Error:", emailErr.message);
            }
        }

        // 4. Send SMS via Fast2SMS (Secondary/Parallel)
        const apiKey = process.env.FAST2SMS_API_KEY;
        if (apiKey) {
            try {
                const cleanPhone = phone.replace(/\D/g, '').slice(-10);
                const actionType = isRegister ? 'Registration' : 'Login';
                await axios.post('https://www.fast2sms.com/dev/bulkV2', {
                    message: `GraminSetu ${actionType} OTP: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`,
                    language: "english",
                    route: "q",
                    numbers: cleanPhone
                }, {
                    headers: { 'authorization': apiKey }
                });
                console.log(`[DEBUG] SMS sent via Fast2SMS to ${cleanPhone}`);
                if (sentMethod === 'console') sentMethod = 'sms';
            } catch (smsError) {
                console.error("Fast2SMS Error:", smsError.response?.data || smsError.message);
            }
        }

        // 5. Determine Key for Storage
        // For registration, we key by Email. For login (if enabled), phone.
        const key = isRegister ? email : phone;

        // 6. Store OTP (Expires in 5 mins)
        otpStore.set(key, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

        // 7. Fallback Log
        console.log(`[DEV MODE] OTP for ${key}: ${otp}`);

        res.json({ message: `OTP sent successfully via ${sentMethod}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const storedData = otpStore.get(phone);
        if (!storedData) {
            return res.status(400).json({ message: 'OTP expired or not sent' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(phone);
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Valid OTP
        otpStore.delete(phone);
        const user = await User.findOne({ phone });

        // Return Token
        const token = 'dummy_token_' + user.id;
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                village: user.village,
                district: user.district
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Admin Create User (Direct)
router.post('/admin/create-user', async (req, res) => {
    try {
        const { name, email, phone, password, role, village, district } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({
            name,
            email,
            phone,
            password, // Plain text as per current implementation
            role: role || 'farmer',
            village,
            district
        });

        await user.save();
        res.json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Profile
router.put('/update', async (req, res) => {
    try {
        const { id, name, phone, village, district } = req.body;

        // Note: In production this should verify the ID from the token middleware
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (village) user.village = village;
        if (district) user.district = district;

        await user.save();

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                village: user.village,
                district: user.district
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
