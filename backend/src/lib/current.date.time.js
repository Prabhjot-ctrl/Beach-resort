/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

/**
 * function to generate current data and time
 * @returns current data and time
 */
const currentDateTime = () => {
  const date = new Date();
  const currentDataTime = date.toLocaleString([], { hour12: true });

  return currentDataTime;
};

module.exports = currentDateTime;
