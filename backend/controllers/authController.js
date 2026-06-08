const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ REGISTER
const register = async (req, res) => {
  const { fullName, email, matrixId, password, confirmPassword } = req.body;

  if (!fullName || !email || !matrixId || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required ❌" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match ❌" });
  }

  if (!email.endsWith('@ugrad.iiuc.ac.bd')) {
    return res.status(400).json({ message: "Only IIUC university email allowed ❌" });
  }

  try {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists ❌" });
    }

    const existingMatrix = await User.findOne({ where: { matrixId } });
    if (existingMatrix) {
      return res.status(400).json({ message: "Matrix ID already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      matrixId,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful ✅",
      token: generateToken(user.id),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        matrixId: user.matrixId,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required ❌" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password ❌" });
    }

    res.status(200).json({
      message: "Login successful ✅",
      token: generateToken(user.id),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        matrixId: user.matrixId,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login };