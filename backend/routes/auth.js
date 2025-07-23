const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Category = require('../models/Categories'); 
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = "your_super_secret_key";

// POST /signup
router.post("/signup", async (req, res) => {
  try {
    console.log("Incoming signup request:", req.body);

    const { firstName, lastName, username, email, password, profilePhoto } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const finalUsername = username?.trim() || firstName;
    const existingUsername = await User.findOne({ username: finalUsername });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      username: finalUsername,
      email,
      password: hashedPassword,
      profilePhoto: profilePhoto || null,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err); // <-- Full error object
    res.status(500).json({ message: "Error signing up", error: err.message });
  }
});


// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(403).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ Send back user info (excluding password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// GET /profile (Protected)
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    const updateData = {
      firstName,
      lastName,
      username,
      email
    };

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});

// GET /api/users - Fetch all users (admin only)
router.get("/users", verifyToken, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// PUT /api/users/:id - Update user role (admin only)
router.put("/users/:id", verifyToken, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role", error: err.message });
  }
});

// POST /api/auth/categories - Add a new category (admin only)
router.post("/categories", verifyToken, async (req, res) => {
  const { name, subcategories } = req.body;
  if (!name || !Array.isArray(subcategories)) {
    return res.status(400).json({ message: "Name and subcategories are required" });
  }

  const existing = await Category.findOne({ name });
  if (existing) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = new Category({ name, subcategories });
  await category.save();
  res.status(201).json({ message: "Category added successfully", category });
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
});

// PUT /api/auth/categories/:id - Update a category
router.put("/categories/:id", verifyToken, async (req, res) => {
  const { name, subcategories } = req.body;

  if (!name || !Array.isArray(subcategories)) {
    return res.status(400).json({ message: "Name and subcategories are required" });
  }

  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, subcategories },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", category: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating category", error: err.message });
  }
});


router.delete("/categories/:id", verifyToken, async (req, res) => {
  try {
    const categoryId = req.params.id;

    const used = await Product.findOne({ category: categoryId }); // 🔁 corrected here
    if (used) {
      return res.status(400).json({ message: "Cannot delete: category is in use by a product." });
    }

    await Category.findByIdAndDelete(categoryId);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
});

// DELETE /api/auth/categories/:id/subcategory
router.delete("/categories/:id/subcategory", verifyToken, async (req, res) => {
  const { subcategory } = req.body;
  if (!subcategory) return res.status(400).json({ message: "Subcategory is required" });

  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Check if subcategory is used in any product
    const used = await Product.findOne({ category: category.name, subcategory });
    if (used) {
      return res.status(400).json({ message: "Cannot delete: subcategory is in use by a product." });
    }

    // Remove subcategory
    category.subcategories = category.subcategories.filter(sub => sub !== subcategory);
    await category.save();

    res.status(200).json({ message: "Subcategory deleted successfully", category });
  } catch (err) {
    res.status(500).json({ message: "Error deleting subcategory", error: err.message });
  }
});



// Set up upload folder if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });

// ✅ POST /api/auth/products - Add Product
router.post("/products", verifyToken, upload.single("image"), async (req, res) => {
  try {
    // Optional: check if user is admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can add products." });
    }

    const { name, category, subcategory, price, quantity, details } = req.body;

    if (!name || !category || !subcategory || !price || !quantity) {
      return res.status(400).json({ message: "All fields except details are required." });
    }

    const product = new Product({
      name,
      category,
      subcategory,
      price,
      quantity,
      details,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
});

// GET /products?category=CategoryName
router.get("/products", verifyToken, async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) return res.status(400).json({ message: "Category is required" });

    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// Route 2: Get products by category and subcategory
// GET /products/by-subcategory?category=CategoryName&subcategory=SubcategoryName
router.get("/products/by-subcategory", verifyToken, async (req, res) => {
  const { category, subcategory } = req.query;
  if (!category || !subcategory) {
    return res.status(400).json({ message: "Category and subcategory are required" });
  }

  try {
    const products = await Product.find({ category, subcategory });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subcategory products", error: err.message });
  }
});

// PUT /products/:id — Update product (admin only)
router.put("/products/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update products." });
    }

    const updateData = {
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      price: req.body.price,
      quantity: req.body.quantity,
      details: req.body.details,
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});


// DELETE /api/auth/products/:id/quantity
router.delete("/products/:id/quantity", verifyToken, async (req, res) => {
  try {
    console.log("Incoming DELETE quantity request:", req.body);
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete product quantity" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.quantity) {
      return res.status(400).json({ message: "Quantity exceeds available stock" });
    }

    // Update or delete
    if (quantity === product.quantity) {
      await product.deleteOne();
      return res.json({ message: "Product deleted completely" });
    } else {
      product.quantity -= quantity;
      await product.save();
      return res.json({ message: `Reduced quantity by ${quantity}`, product });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product quantity", error: err.message });
  }
});



router.get("/categories/by-name/:name", verifyToken, async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.name });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", error: err.message });
  }
});

// GET a product by ID
router.get("/products/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
});


// Express backend
router.put('/products/:id/decrease', async (req, res) => {
  const { quantity } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (product.quantity < quantity) {
    return res.status(400).json({ message: 'Not enough stock' });
  }

  product.quantity -= quantity;
  await product.save();

  res.json({ message: 'Quantity reduced successfully' });
});

router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});



// Middleware: JWT verification
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

module.exports = router;
