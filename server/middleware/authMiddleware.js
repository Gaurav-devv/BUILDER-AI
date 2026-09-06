import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    // req.cookies may be undefined if cookie-parser isn't mounted — use ?. everywhere
    const cookieToken = req.cookies?.token ?? null;

    // Authorization header fallback — guard every property access
    const authHeader = req.headers?.authorization ?? "";
    const bearerToken =
      authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No session token provided." });
    }

    // jwt.verify throws on invalid/expired tokens — caught below
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );

    req.user = decoded;
    next();
  } catch (err) {
    // Never let JWT errors bubble up as a 500 — always return a clean 401
    return res
      .status(401)
      .json({ error: "Session expired or invalid. Please sign in again." });
  }
}

export function optionalAuthMiddleware(req, res, next) {
  try {
    const cookieToken = req.cookies?.token ?? null;
    const authHeader = req.headers?.authorization ?? "";
    const bearerToken =
      authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );

    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}
