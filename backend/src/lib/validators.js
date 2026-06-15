/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

/**
 * Validates whether a string is a valid UUID v4 format.
 *
 * @param {string} str - The string to validate
 * @returns {boolean} - true if valid UUID
 */
const isValidUUID = (str) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

/**
 * Maps Prisma BookingStatus enum values to the API-facing string values.
 * Prisma uses 'in_reviews' (underscore) because enum values cannot contain hyphens.
 * The API must continue returning 'in-reviews' (hyphen) for backward compatibility.
 *
 * @param {string} status - Prisma enum value (e.g., 'in_reviews')
 * @returns {string} - API-facing value (e.g., 'in-reviews')
 */
const bookingStatusToApi = (status) => (status === 'in_reviews' ? 'in-reviews' : status);

/**
 * Maps an API-facing booking status string to the Prisma enum value.
 *
 * @param {string} status - API value (e.g., 'in-reviews')
 * @returns {string} - Prisma enum value (e.g., 'in_reviews')
 */
const bookingStatusFromApi = (status) => (status === 'in-reviews' ? 'in_reviews' : status);

module.exports = { isValidUUID, bookingStatusToApi, bookingStatusFromApi };
