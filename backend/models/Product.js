const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  details: { type: String },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
