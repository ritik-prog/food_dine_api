const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  total: {
    type: Number,
  },
  menuItems: {
    type: [mongoose.Schema.ObjectId],
    ref: "Restaurant",
    required: true,
  },
});

const Cart = mongoose.Model("Cart", cartSchema);

module.exports = Cart;
