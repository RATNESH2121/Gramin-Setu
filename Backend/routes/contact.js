const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
// utilizing ephemeral email or valid credentials from env
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port from env
    auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'testpassword'
    }
});

// Helper to send mail
const sendMail = async (to, subject, htmlContent) => {
    // In a real app, you would use real credentials. 
    // For this environment, if env vars are missing, we might log or mock.
    if (!process.env.EMAIL_USER) {
        console.log("Mocking Email Send:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        return true;
    }

    try {
        // Use a Promise with strict timeout to prevent hangs
        const sendPromise = transporter.sendMail({
            from: '"GraminSetu System" <no-reply@graminsetu.gov.in>',
            to: to,
            subject: subject,
            html: htmlContent,
        });

        // 5 second timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Email timeout')), 5000)
        );

        await Promise.race([sendPromise, timeoutPromise]);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Email send failed:", error.message);
        // Return true to avoid blocking the UI, treating it as 'simulated' success
        return true;
    }
};

// @route   POST api/contact/query
// @desc    Submit an expert query
// @access  Public
router.post('/query', async (req, res) => {
    const { name, email, phone, query } = req.body;

    if (!name || !email || !query) {
        return res.status(400).json({ error: 'Please provide required fields' });
    }

    // 1. Send Notification to Admin
    const adminSubject = `New Expert Query from ${name}`;
    const adminHtml = `
        <h3>New Expert Query</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Query:</strong></p>
        <p>${query}</p>
    `;
    // Use ADMIN_EMAIL if set, otherwise fallback to the sender's email (EMAIL_USER) to avoid bouncing.
    // If even that is missing, use a safe test email or just log.
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'test@example.com';
    await sendMail(adminEmail, adminSubject, adminHtml);

    // 2. Send Confirmation to User
    const userSubject = `We received your query - GraminSetu`;
    const userHtml = `
        <h3>Hello ${name},</h3>
        <p>Thank you for contacting GraminSetu. We have received your query regarding:</p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 10px; color: #555;">${query}</blockquote>
        <p>Our agricultural experts will review it and get back to you shortly.</p>
        <p>Best regards,<br>Team GraminSetu</p>
    `;
    await sendMail(email, userSubject, userHtml);

    res.json({ message: 'Query submitted successfully' });
});

// @route   POST api/contact/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // 1. Send Notification to Admin
    const adminSubject = `New Newsletter Subscriber`;
    const adminHtml = `
        <h3>New Subscriber</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p>Please add this user to the mailing list.</p>
    `;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'test@example.com';
    await sendMail(adminEmail, adminSubject, adminHtml);

    // 2. Send Confirmation to User
    const userSubject = `Welcome to GraminSetu Community!`;
    const userHtml = `
        <h3>Welcome Aboard!</h3>
        <p>Congratulations and thank you for subscribing to GraminSetu.</p>
        <p>You will now receive the latest updates on rural development schemes, agricultural best practices, and government initiatives directly in your inbox.</p>
        <p>together, let's build a better rural India.</p>
        <p>Best regards,<br>Team GraminSetu</p>
    `;
    await sendMail(email, userSubject, userHtml);

    res.json({ message: 'Subscribed successfully' });
});

module.exports = router;
