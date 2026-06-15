/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

const router = require('express').Router();
const { getDashboardData } = require('../controllers/apps.controllers');
const { isAuthenticatedUser, isBlocked, isAdmin } = require('../middleware/app.authentication');

// get dashboard info by admin
router.route('/dashboard').get(isAuthenticatedUser, isBlocked, isAdmin, getDashboardData);

module.exports = router;
