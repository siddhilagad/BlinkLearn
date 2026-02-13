import React, { useState } from "react";
import "./search.css";

function Search() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("");

  const handleFilter = (e) => {
    e.preventDefault();

    const filters = {
      search,
      category,
      price,
      rating,
    };

    console.log("Applied Filters:", filters);
    alert("Filters applied! Check console.");
  };

  return (
    <form className="search-filter" onSubmit={handleFilter}>
      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Category</option>
        <option value="web">Web Development</option>
        <option value="data">Data Science</option>
        <option value="design">Design</option>
        <option value="ai">AI & ML</option>
      </select>

      <select value={price} onChange={(e) => setPrice(e.target.value)}>
        <option value="">Price</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
        <option value="low">Below ₹500</option>
        <option value="high">Above ₹500</option>
      </select>

      <select value={rating} onChange={(e) => setRating(e.target.value)}>
        <option value="">Rating</option>
        <option value="4">4★ & above</option>
        <option value="3">3★ & above</option>
        <option value="2">2★ & above</option>
      </select>

      <button type="submit">Apply</button>
    </form>
  );
}

export default Search;

