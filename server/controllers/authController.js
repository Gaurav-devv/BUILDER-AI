import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Helper to set cookie
const setSessionCookie = (res, payload) => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });
};

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email: trimmedEmail,
      password,
    });

    setSessionCookie(res, { userId: user._id.toString(), email: user.email });

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    setSessionCookie(res, { userId: user._id.toString(), email: user.email });

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: err.message || "Login failed" });
  }
}

export async function logout(_req, res) {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed" });
  }
}

export async function me(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(200).json({ user: null });
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Me Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch user session" });
  }
}
