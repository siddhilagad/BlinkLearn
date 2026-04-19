import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

function CartPage() {
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/cart/${user.user_id}`);
      setCartItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (course_id) => {
    await axios.delete("http://localhost:5000/cart/remove", {
      data: { user_id: user.user_id, course_id },
    });
    setCartItems((prev) => prev.filter((item) => item.course_id !== course_id));
  };

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  if (loading) return <div className="cart-loading">Loading cart...</div>;

  return (
    <div className="cart-page">
      <h2 className="cart-heading">🛒 My Cart</h2>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <button onClick={() => navigate("/")}>Browse Courses</button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.cart_id} className="cart-card">
                <img
                  src={
                    item.thumbnail
                      ? `http://localhost:5000/uploads/${item.thumbnail}`
                      : "/placeholder.png"
                  }
                  alt={item.title}
                  className="cart-thumb"
                />
                <div className="cart-info">
                  <h3>{item.title}</h3>
                  <span className="cart-level">{item.level}</span>
                  <p className="cart-price">₹ {parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div className="cart-actions">
                  <button
                    className="cart-checkout-btn"
                    onClick={() =>
                      navigate(`/checkout/${item.course_id}`, {
                        state: { course: item, fromCart: true },
                      })
                    }
                  >
                    Buy Now
                  </button>
                  <button
                    className="cart-remove-btn"
                    onClick={() => handleRemove(item.course_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items ({cartItems.length})</span>
              <span>₹ {total.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>₹ {total.toFixed(2)}</span>
            </div>
            <button
              className="summary-checkout-btn"
              onClick={() =>
                navigate("/checkout/cart", { state: { items: cartItems, total } })
              }
            >
              Checkout All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;