import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized, no token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Not authorized, user no longer exists" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Not authorized, invalid or expired token" });
  }
}

export async function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden, insufficient permissions" });
    }
    next();
  };
}
