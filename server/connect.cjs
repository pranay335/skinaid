const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config.env" });

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas via mongoose
mongoose.connect(process.env.MONGO_URI, { dbName: "SkinAid" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// --- USER SCHEMA ---
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// --- MODEL DEFINITION UPDATED ---
// The third argument "Users" forces the collection name to be exactly that.
const User = mongoose.model("Users", UserSchema, "Users");

app.get("/", (req, res) => {
  res.send("🚀 Backend server is running!");
});

// --- NEW REGISTRATION ROUTE ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1. Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields." });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create a new user instance
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword // Save the hashed password
    });

    // 5. Save the user to the database
    const savedUser = await newUser.save();

    // 6. (Optional but Recommended) Create a JWT token for immediate login
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 7. Send a success response
    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: { // Changed "User" to "user" for consistency with frontend code
        id: savedUser._id,
        firstName: savedUser.firstName,
        email: savedUser.email
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});


// Example existing routes (can be updated similarly)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords from result
    res.json(users);
  } catch (error) {
     res.status(500).json({ message: "Server error." });
  }
});

// Your login route should also be updated to use bcrypt to compare passwords
app.post("/api/auth/login", async (req, res) => {
  // This is a placeholder - you'll need to implement password comparison here!
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) res.json({ message: "Login successful", user });
  else res.status(401).json({ message: "User not found" });
});

// Keep server alive
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));

