const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Stripe = require("stripe");
const crypto = require("crypto");
const db = require("../db");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ─────────────────────────────────────────────
//  RAZORPAY — Create Order
// ─────────────────────────────────────────────
router.post("/razorpay/create-order", async (req, res) => {
  const { user_id, course_id, amount } = req.body; // amount in rupees
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${user_id}_${course_id}_${Date.now()}`,
    });

    // Save pending order in DB
    await db.query(
      `INSERT INTO orders (user_id, course_id, amount, currency, payment_gateway, order_id, status)
       VALUES (?, ?, ?, 'INR', 'razorpay', ?, 'pending')`,
      [user_id, course_id, amount, order.id]
    );

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ message: "Razorpay order creation failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
//  RAZORPAY — Verify Payment
// ─────────────────────────────────────────────
router.post("/razorpay/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, course_id } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  try {
    // Mark order as paid
    await db.query(
      `UPDATE orders SET status = 'paid', payment_id = ?
       WHERE order_id = ?`,
      [razorpay_payment_id, razorpay_order_id]
    );

    // Auto-enroll student
    await db.query(
      "INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [user_id, course_id]
    );

    // Remove from cart if exists
    await db.query(
      "DELETE FROM cart WHERE user_id = ? AND course_id = ?",
      [user_id, course_id]
    );

    res.json({ message: "Payment verified and enrolled!" });
  } catch (err) {
    res.status(500).json({ message: "DB update failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
//  STRIPE — Create Payment Intent
// ─────────────────────────────────────────────
router.post("/stripe/create-intent", async (req, res) => {
  const { user_id, course_id, amount } = req.body; // amount in rupees/USD
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents/paise
      currency: "inr", // change to "usd" for international
      metadata: { user_id: String(user_id), course_id: String(course_id) },
    });

    await db.query(
      `INSERT INTO orders (user_id, course_id, amount, currency, payment_gateway, order_id, status)
       VALUES (?, ?, ?, 'INR', 'stripe', ?, 'pending')`,
      [user_id, course_id, amount, paymentIntent.id]
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: "Stripe intent creation failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
//  STRIPE — Webhook (confirm payment server-side)
// ─────────────────────────────────────────────
router.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const { user_id, course_id } = intent.metadata;

    await db.query(
      `UPDATE orders SET status = 'paid', payment_id = ? WHERE order_id = ?`,
      [intent.id, intent.id]
    );
    await db.query(
      "INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [user_id, course_id]
    );
    await db.query(
      "DELETE FROM cart WHERE user_id = ? AND course_id = ?",
      [user_id, course_id]
    );
  }

  res.json({ received: true });
});

module.exports = router;