import jwt from 'jsonwebtoken';

// Ensure you have JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    console.error("FATAL ERROR: JWT secrets are not defined in environment variables.");
    process.exit(1);
}

const ACCESS_TOKEN_EXPIRY = '15m'; // e.g., 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // e.g., 7 days

export const generateTokens = (userId: string): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): { userId: string } | null => {
    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
        return decoded;
    } catch (error) {
        return null;
    }
};