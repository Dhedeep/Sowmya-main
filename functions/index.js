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
// Escape HTML to prevent unsafe content in emails
const escapeHtml = (value) => {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Format amount in Indian Rupees
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(Number(amount) || 0);
};
// Send professional order confirmation email
exports.sendOrderConfirmationEmail = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const order = snap.data();
        const orderId = context.params.orderId;

        try {
            // Read customer email from the order
            const customerEmail = order.customerEmail;
            const customerName = order.customerName || 'Customer';

            if (!customerEmail) {
                console.error(
                    `Order ${orderId} does not contain a customer email.`
                );

                return null;
            }

            // Prepare order items
            const items = Array.isArray(order.items)
                ? order.items
                : [];

            const itemsHtml = items.map((item) => {
                const itemName = escapeHtml(item.name || 'Product');
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                const size = item.size
                    ? `<br><small>Size: ${escapeHtml(item.size)}</small>`
                    : '';
                const color = item.color
                    ? `<br><small>Color: ${escapeHtml(item.color)}</small>`
                    : '';

                return `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
                            <strong>${itemName}</strong>
                            ${size}
                            ${color}
                        </td>

                        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eeeeee;">
                            ${quantity}
                        </td>

                        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eeeeee;">
                            ${formatCurrency(price * quantity)}
                        </td>
                    </tr>
                `;
            }).join('');

            const totalAmount = formatCurrency(order.total);
            const safeOrderId = escapeHtml(orderId);
            const safeCustomerName = escapeHtml(customerName);
            const paymentId = escapeHtml(order.paymentId || 'N/A');

            
const mailOptions = {
    from: '"Sowmya Selections" <info@sowmyaselections.com>',
    to: customerEmail,

    subject: 'Your Order Has Been Confirmed! 🎉',

    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
            font-family: Arial, Helvetica, sans-serif;
            color: #333333;
        ">

            <div style="
                max-width: 600px;
                margin: 30px auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                border: 1px solid #eeeeee;
            ">

                <!-- Header -->
                <div style="
                    background-color: #111111;
                    padding: 25px 20px;
                    text-align: center;
                ">
                    <h1 style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 24px;
                    ">
                        Sowmya Selections
                    </h1>
                </div>

                <!-- Content -->
                <div style="
                    padding: 30px 25px;
                    line-height: 1.7;
                ">

                    <h2 style="
                        color: #222222;
                        font-size: 24px;
                        margin-top: 0;
                    ">
                        Your Order Has Been Confirmed! 🎉
                    </h2>

                    <p>
                        Dear <strong>${safeCustomerName}</strong>,
                    </p>

                    <p>
                        Thank you for shopping with Sowmya Selections.
                    </p>

                    <p>
                        We are happy to inform you that your order
                        <strong>#${safeOrderId}</strong> has been successfully placed.
                    </p>

                    <!-- Delivery Information -->
                    <h3 style="
                        color: #222222;
                        margin-top: 25px;
                        margin-bottom: 10px;
                    ">
                        Delivery Information
                    </h3>

                    <p style="margin: 8px 0;">
                        <strong>DTDC:</strong>
                        Expected delivery within 3–4 working days.
                    </p>

                    <p style="margin: 8px 0;">
                        <strong>Normal Post:</strong>
                        Delivery may take up to 1 week.
                    </p>

                    
<p>
    Your order is currently being processed.
    We will share tracking details with you once
    your order has been dispatched.
</p>

<!-- Tracking Notification -->
<div style="
    background-color: #f8f8f8;
    border-left: 4px solid #111111;
    padding: 15px;
    margin: 20px 0;
    border-radius: 5px;
">
    <p style="
        margin: 0;
        color: #333333;
        line-height: 1.6;
    ">
        <strong>📱 Tracking Updates:</strong><br>
        Once your order has been dispatched, tracking details
        will be sent to the mobile number provided in your
        delivery address. Please make sure the number is
        correct and accessible.
    </p>
</div>

                    <p>
                        Thank you for choosing Sowmya Selections! ❤️
                    </p>

                    <p style="margin-top: 30px;">
                        Regards,<br>
                        <strong>Sowmya Selections Team</strong>
                    </p>

                </div>

                <!-- Footer -->
                <div style="
                    background-color: #f5f5f5;
                    padding: 18px;
                    text-align: center;
                    color: #777777;
                    font-size: 12px;
                ">
                    <p style="margin: 0;">
                        © ${new Date().getFullYear()}
                        Sowmya Selections. All rights reserved.
                    </p>

                    <p style="margin: 6px 0 0;">
                        Contact: info@sowmyaselections.com
                    </p>
                </div>

            </div>

        </body>
        </html>
    `
};

            await transporter.sendMail(mailOptions);

            console.log(
                `Order confirmation email sent successfully to ${customerEmail} for order ${orderId}`
            );

            return null;

        } catch (error) {
            console.error(
                `Failed to send order confirmation email for order ${orderId}:`,
                error
            );

            // Do not throw here because the order itself has already been created.
            // The email trigger can be retried depending on its execution behavior.
            return null;
        }
    });