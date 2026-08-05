import jwt from "jsonwebtoken";

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: EXPIRES_IN,
      issuer: "cortex",
      audience: "cortex-app",
      subject: String(user._id),
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: "cortex",
    audience: "cortex-app",
  });
}
