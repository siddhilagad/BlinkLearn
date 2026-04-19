import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./CheckoutPage.css";

// ── Stripe Card Form ──────────────────────────────────────────────
function StripeForm({ amount, user_id, course_id, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStripePayment = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    setErrorMsg("");
    try {
      const { data } = await axios.post(
        "http://localhost:5000/payment/stripe/create-intent",
        { user_id, course_id, amount }
      );

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setErrorMsg(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        onSuccess("stripe");
      }
    } catch (err) {
      setErrorMsg("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="stripe-form">
      <p className="stripe-label">Enter Card Details</p>
      <div className="stripe-card-wrapper">
        <CardElement
          className="stripe-card-element"
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1a1a1a",
                fontFamily: "sans-serif",
                "::placeholder": { color: "#aaa" },
              },
              invalid: { color: "#e53e3e" },
            },
          }}
        />
      </div>
      {errorMsg && (
        <p className="pay-error">⚠️ {errorMsg}</p>
      )}
      <button
        className="pay-btn stripe-btn"
        onClick={handleStripePayment}
        disabled={paying || !stripe}
      >
        {paying ? (
          <span className="btn-spinner">Processing...</span>
        ) : (
          `💳 Pay ₹${amount.toFixed(2)} with Stripe`
        )}
      </button>
    </div>
  );
}

// ── Razorpay Button ───────────────────────────────────────────────
function RazorpayButton({ amount, user_id, course_id, onSuccess }) {
  const [paying, setPaying] = useState(false);

  const handleRazorpay = async () => {
    // Check Razorpay SDK loaded
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    // Check key exists
    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!rzpKey) {
      alert("Razorpay key is missing. Check your .env file.");
      return;
    }

    setPaying(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/payment/razorpay/create-order",
        { user_id, course_id, amount }
      );

      const options = {
        key: rzpKey,
        amount: data.amount,
        currency: data.currency,
        name: "BlinkLearn",
        description: "Course Purchase",
        image: "/logo.png", // your logo if available
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await axios.post("http://localhost:5000/payment/razorpay/verify", {
              ...response,
              user_id,
              course_id,
            });
            onSuccess("razorpay");
          } catch (err) {
            alert("Payment verification failed. Contact support.");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#5c6ef8" },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        alert(`Payment failed: ${response.error.description}`);
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      alert(
        err.response?.data?.message || "Could not initiate Razorpay payment."
      );
      setPaying(false);
    }
  };

  return (
    <button
      className="pay-btn razorpay-btn"
      onClick={handleRazorpay}
      disabled={paying}
    >
      {paying ? "Opening Razorpay..." : `🏦 Pay ₹${amount.toFixed(2)} with Razorpay`}
    </button>
  );
}

// ── Main Checkout Page ────────────────────────────────────────────
function CheckoutPage() {
  const { courseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const course = state?.course;
  const amount = course ? parseFloat(course.price) : 0;

  const [gateway, setGateway] = useState("razorpay");
  const [paid, setPaid] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeError, setStripeError] = useState("");

  // ── Load Stripe lazily (fixes "undefined key" error) ──
  useEffect(() => {
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (key && key.startsWith("pk_")) {
      setStripePromise(loadStripe(key));
      setStripeError("");
    } else {
      setStripeError(
        "Stripe public key is missing or invalid. Add VITE_STRIPE_PUBLIC_KEY to your .env file."
      );
    }
  }, []);

  // ── Load Razorpay SDK dynamically ──
  useEffect(() => {
    if (document.getElementById("razorpay-sdk")) return; // already loaded
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSuccess = () => {
    setPaid(true);
    setTimeout(
      () => navigate(`/course/${courseId || course?.course_id}`),
      2500
    );
  };

  // ── Guard: redirect to login if not logged in ──
  if (!user) {
    navigate("/login");
    return null;
  }

  // ── Success screen ──
  if (paid) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>You are now enrolled. Redirecting to your course...</p>
        </div>
      </div>
    );
  }

  // ── No course guard ──
  if (!course) {
    return (
      <div className="checkout-page">
        <div className="checkout-error">
          <div className="error-icon">!</div>
          <p>No course selected.</p>
          <button onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-card">

        {/* ── Header ── */}
        <button className="checkout-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 className="checkout-title">Complete Your Purchase</h2>

        {/* ── Course Summary ── */}
        <div className="checkout-course-info">
          {course.thumbnail && (
            <img
              src={`http://localhost:5000/uploads/${course.thumbnail}`}
              alt={course.title}
              className="checkout-thumb"
            />
          )}
          <div className="checkout-course-text">
            <h3>{course.title}</h3>
            {course.level && (
              <span className="checkout-level-badge">{course.level}</span>
            )}
            <p className="checkout-amount">₹ {amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="checkout-divider" />

        {/* ── Gateway Selector ── */}
        <p className="checkout-label">Choose Payment Method</p>
        <div className="gateway-selector">
          <button
            className={`gateway-btn ${gateway === "razorpay" ? "active" : ""}`}
            onClick={() => setGateway("razorpay")}
          >
            <span className="gateway-icon">🏦</span>
            <span>Razorpay</span>
            {gateway === "razorpay" && (
              <span className="gateway-check">✓</span>
            )}
          </button>
          <button
            className={`gateway-btn ${gateway === "stripe" ? "active" : ""}`}
            onClick={() => setGateway("stripe")}
          >
            <span className="gateway-icon">💳</span>
            <span>Stripe</span>
            {gateway === "stripe" && (
              <span className="gateway-check">✓</span>
            )}
          </button>
        </div>

        <div className="checkout-divider" />

        {/* ── Payment UI ── */}
        {gateway === "razorpay" ? (
          <RazorpayButton
            amount={amount}
            user_id={user.user_id}
            course_id={course.course_id}
            onSuccess={handleSuccess}
          />
        ) : stripeError ? (
          <div className="stripe-config-error">
            <p>⚠️ {stripeError}</p>
          </div>
        ) : stripePromise ? (
          <Elements stripe={stripePromise}>
            <StripeForm
              amount={amount}
              user_id={user.user_id}
              course_id={course.course_id}
              onSuccess={handleSuccess}
            />
          </Elements>
        ) : (
          <div className="stripe-loading">
            <div className="stripe-spinner" />
            <p>Loading Stripe...</p>
          </div>
        )}

        {/* ── Secure note ── */}
        <p className="checkout-secure-note">🔒 100% Secure Payment</p>
      </div>
    </div>
  );
}

export default CheckoutPage;