/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash a plain-text password using bcrypt.
 *
 * @param {string} password - Plain-text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => bcrypt.hash(password, 8);

/**
 * Compare a plain-text password with a bcrypt hash.
 *
 * @param {string} password - Plain-text password
 * @param {string} hashedPassword - Bcrypt hashed password
 * @returns {Promise<boolean>} - true if match
 */
const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

/**
 * Generate a JWT access token for a user.
 *
 * @param {object} user - User object with `id` field
 * @returns {string} - JWT token
 */
const getJWTToken = (user) => jwt.sign(
  { id: user.id },
  process.env.JWT_SECRET_KEY,
  { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES }
);

/**
 * Generate a JWT refresh token for a user.
 *
 * @param {object} user - User object with `id` field
 * @returns {string} - JWT refresh token
 */
const getJWTRefreshToken = (user) => jwt.sign(
  { id: user.id },
  process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
  { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES }
);

/**
 * Generate a password reset token and its hashed counterpart.
 *
 * @returns {object} - { resetToken, resetPasswordToken, resetPasswordExpire }
 */
const getResetPasswordToken = () => {
  // generating token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // hashing and adding resetPasswordToken
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

  return { resetToken, resetPasswordToken, resetPasswordExpire };
};

/**
 * Generate an email verification token and its hashed counterpart.
 *
 * @returns {object} - { verificationToken, emailVerificationToken, emailVerificationExpire }
 */
const getEmailVerificationToken = () => {
  // generating token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // hashing and adding emailVerificationToken
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  const emailVerificationExpire = new Date(Date.now() + 15 * 60 * 1000);

  return { verificationToken, emailVerificationToken, emailVerificationExpire };
};

/**
 * Sanitize a userName by replacing spaces with dashes.
 *
 * @param {string} userName - Raw userName
 * @returns {string} - Sanitized userName
 */
const sanitizeUserName = (userName) => (userName ? userName.replace(/\s/g, '-') : userName);

/**
 * Sanitize a room slug by replacing spaces with dashes.
 *
 * @param {string} slug - Raw slug
 * @returns {string} - Sanitized slug
 */
const sanitizeRoomSlug = (slug) => (slug ? slug.replace(/\s/g, '-') : slug);

module.exports = {
  hashPassword,
  comparePassword,
  getJWTToken,
  getJWTRefreshToken,
  getResetPasswordToken,
  getEmailVerificationToken,
  sanitizeUserName,
  sanitizeRoomSlug
};
