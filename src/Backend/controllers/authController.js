import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

export async function signup(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
    });

    const token = generateAccessToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateAccessToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    // Email is permanent: only names are editable here.
    const firstName = String(req.body?.firstName || "").trim();
    const lastName = String(req.body?.lastName || "").trim();

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First name and last name are required" });
    }

    req.user.firstName = firstName;
    req.user.lastName = lastName;
    await req.user.save();

    // Re-issue the token so its name/email claims match the updated profile.
    const token = generateAccessToken(req.user);

    res.json({
      token,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
