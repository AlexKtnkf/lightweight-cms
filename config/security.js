const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers middleware
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.quilljs.com", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://challenges.cloudflare.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.quilljs.com", "https://fonts.googleapis.com"],
  imgSrc: ["'self'", "data:", "https:"],
  fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"],
  frameSrc: ["'self'", "https://challenges.cloudflare.com"],
};

// In production, restrict connectSrc. In development, allow WebSocket connections for Vite HMR
if (process.env.NODE_ENV === 'production') {
  cspDirectives.connectSrc = ["'self'", "https://challenges.cloudflare.com"];
} else {
  // Development: allow WebSocket connections for Vite HMR (ws://localhost:*)
  cspDirectives.connectSrc = ["'self'", "https://challenges.cloudflare.com", "ws://localhost:*", "ws://127.0.0.1:*"];
}

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: cspDirectives,
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// General rate limiter (for public routes only)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs (increased for better UX)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for login
// In development, be more lenient and skip successful requests
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // More lenient in development
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false, // Count failed attempts
});

// Admin route rate limiter (more lenient for authenticated users)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs (increased for admin operations)
  message: 'Too many requests to admin area, please try again later.'
});

// File upload rate limiter (very lenient for uploads)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 uploads per 15 minutes
  message: 'Too many upload requests, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful uploads
});

// Public booking rate limiter — prevents spam bookings from a single IP
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: 'Trop de demandes de réservation depuis cette IP. Veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  securityHeaders,
  generalLimiter,
  loginLimiter,
  adminLimiter,
  uploadLimiter,
  bookingLimiter
};
