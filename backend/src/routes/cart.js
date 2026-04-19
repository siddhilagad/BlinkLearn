const express = require("express");
const router = express.Router();
const db = require("../db");

// Add to cart
router.post("/add", async (req, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id)
    return res.status(400).json({ message: "Missing user_id or course_id" });
  try {
    await db.query(
      "INSERT IGNORE INTO cart (user_id, course_id) VALUES (?, ?)",
      [user_id, course_id]
    );
    res.json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get cart items for a user
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT c.id as cart_id, co.course_id, co.title, co.price, co.thumbnail, co.level
       FROM cart c
       JOIN courses co ON c.course_id = co.course_id
       WHERE c.user_id = ?`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Remove from cart
router.delete("/remove", async (req, res) => {
  const { user_id, course_id } = req.body;
  try {
    await db.query(
      "DELETE FROM cart WHERE user_id = ? AND course_id = ?",
      [user_id, course_id]
    );
    res.json({ message: "Removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;