import React, { useState } from "react";
import "./EnrollmentSection.css";

const EnrollmentSection = ({ course }) => {
  const [cartAdded, setCartAdded] = useState(false);
  const isFree = !course.price || course.price === 0;

  const handleEnroll = () => {
    alert(`Successfully enrolled in "${course.title}"!`);
  };

  const handleBuyNow = () => {
    // Navigate to checkout or payment page
    window.location.href = `/checkout/${course.id}`;
  };

  const handleAddToCart = () => {
    setCartAdded(true);
    // your cart logic here (e.g. dispatch to Redux / Context)
    setTimeout(() => setCartAdded(false), 2000);
  };

  return (
    <div className="enrollment-card">
      {/* Price */}
      <div className="enrollment-price">
        {isFree ? (
          <span className="price-free">Free</span>
        ) : (
          <span className="price-amount">₹ {course.price.toFixed(2)}</span>
        )}
      </div>

      {/* Action Buttons */}
      {isFree ? (
        <>
          <button className="btn-enroll" onClick={handleEnroll}>
            Enroll Now
          </button>
          <p className="enrollment-note">No payment required</p>
        </>
      ) : (
        <>
          <button className="btn-buy" onClick={handleBuyNow}>
            Buy Now
          </button>
          <button
            className={`btn-cart ${cartAdded ? "btn-cart--added" : ""}`}
            onClick={handleAddToCart}
          >
            {cartAdded ? "✓ Added to Cart" : "Add to Cart"}
          </button>
          <p className="enrollment-note">🔒 Secure Enrollment</p>
        </>
      )}
    </div>
  );
};

export default EnrollmentSection;