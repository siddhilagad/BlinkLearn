import React from "react";
import { addToWishlist } from "../utils/wishlist";

function CourseCard({ course }) {

  return (
    <div className="course-card">

      <h3>{course.title}</h3>

      <button onClick={() => addToWishlist(course)}>
        ❤️ Add to Wishlist
      </button>

    </div>
  );
}

export default CourseCard;