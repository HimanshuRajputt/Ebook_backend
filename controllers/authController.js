const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

const authController = {
  // User Registration
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          error: "Username, email, and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters long",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          error: "User with this email or username already exists",
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Registration failed",
        message: error.message,
      });
    }
  },

  // User Login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        return res.status(400).json({
          error: "Username and password are required",
        });
      }

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
      });

      if (!user) {
        return res.status(401).json({
          error: "Invalid credentials",
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Invalid credentials",
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Login failed",
        message: error.message,
      });
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      res.json({
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          createdAt: req.user.createdAt,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        error: "Failed to get profile",
        message: error.message,
      });
    }
  },
};

module.exports = authController;
