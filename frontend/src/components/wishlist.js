export const addToWishlist = (course) => {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  const exists = wishlist.some((c) => c.id === course.id);

  if (!exists) {
    wishlist.push(course);

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    // Update navbar count
    window.dispatchEvent(new Event("blinklearn:updateCounts"));
  }
};