const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');

admin.initializeApp();

// CORS middleware - allow all origins for onRequest functions
const corsHandler = cors({ origin: true });

// Razorpay configuration - Live keys
const RAZORPAY_KEY_ID = 'rzp_live_SLAAY79o69FgH6';
const RAZORPAY_KEY_SECRET = 'nYXOjDCIc6k1HxWrV9lguxnh';

// Razorpay instance
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });
};

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@sowmyaselections.com',
        pass: 'oSxe*K+?4+'
    }
});

// Helper function to verify Firebase Auth token from request
const verifyAuth = async (req) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return null;
    }
    try {
        const token = authorization.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return null;
    }
};

exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        // Only allow POST
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Verify authentication
        const user = await verifyAuth(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized. Must be authenticated.' });
        }

        const { data } = req.body;
        const { amount, currency = 'INR', receipt } = data || {};

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required.' });
        }

        try {
            const razorpay = getRazorpayInstance();
            const options = {
                amount: Math.round(amount * 100), // convert to paise
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
            };

            console.log('Creating Razorpay order with options:', JSON.stringify(options));
            const order = await razorpay.orders.create(options);
            console.log('Razorpay order created successfully:', JSON.stringify(order));
            return res.status(200).json({ result: { success: true, order } });
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            console.error('Error details:', JSON.stringify({ message: error.message, statusCode: error.statusCode, error: error.error }));
            return res.status(500).json({ error: { message: error.message || 'Failed to create Razorpay order', status: 'INTERNAL' } });
        }
    });
});

exports.verifyRazorpayPayment = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        // Only allow POST
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Verify authentication
        const user = await verifyAuth(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized. Must be authenticated.' });
        }

        const { data } = req.body;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = data || {};

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification data.' });
        }

        try {
            const key_secret = RAZORPAY_KEY_SECRET;

            // Verify signature
            console.log("=== VERIFY PAYMENT ===");
console.log("Order ID:", razorpay_order_id);
console.log("Payment ID:", razorpay_payment_id);
console.log("Received Signature:", razorpay_signature);

const generated_signature = crypto
  .createHmac("sha256", key_secret)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest("hex");

console.log("Generated Signature:", generated_signature);

if (generated_signature !== razorpay_signature) {
    console.log("❌ SIGNATURE FAILED");

    return res.status(400).json({
        error: {
            message: "Invalid payment signature"
        }
    });
}

console.log("✅ SIGNATURE VERIFIED");

return res.status(200).json({
    result: {
        success: true,
        message: "Payment verified"
    }
});
        } catch (error) {
            console.error('Error verifying payment:', error);
            return res.status(500).json({ error: { message: error.message || 'Failed to verify payment', status: 'INTERNAL' } });
        }
    });
});

exports.sendOTPEmail = functions.https.onCall(async (data, context) => {
    const { email, otp } = data;

    if (!email || !otp) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing email or otp');
    }

    const mailOptions = {
        from: '"Sowmya Selections" <info@sowmyaselections.com>',
        to: email,
        subject: 'Your OTP for Sowmya Selections',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">Sowmya Selections</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for registration/login is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #e91e63; padding: 10px; background: #f9f9f9; text-align: center; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Sowmya Selections. All rights reserved.</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP ${otp} sent to ${email}`);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email', error.message);
    }
});