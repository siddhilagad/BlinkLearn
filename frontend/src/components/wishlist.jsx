import React, { useEffect, useState } from "react";
import "./wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist =
      JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((course) => course.id !== id);

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  return (
    <div className="wishlist-page">

      <h1>My Wishlist ❤️</h1>

      {wishlist.length === 0 ? (
        <p className="empty-text">
          Your wishlist is empty.
        </p>
      ) : (
        <div className="wishlist-grid">

          {wishlist.map((course) => (
            <div className="wishlist-card" key={course.id}>

              <img
                src={course.thumbnail}
                alt={course.title}
              />

              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <button
                className="remove-btn"
                onClick={() => removeFromWishlist(course.id)}
              >
                Remove
              </button>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default Wishlist;