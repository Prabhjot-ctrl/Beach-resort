/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

const { errorResponse, successResponse } = require('../configs/app.response');
const prisma = require('../database/connect.postgres.db');

// TODO: Controller for get users list for admin
exports.getDashboardData = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // Use prisma.count() instead of fetching all documents — much more efficient
    const [
      totalUsers, adminRoleUsers, userRoleUsers,
      registerStatusUsers, loginStatusUsers, logoutStatusUsers,
      blockedStatusUsers, verifiedUsers,
      totalRooms, availableRooms, unavailableRooms, bookedRooms,
      totalBookings, pendingBookings, cancelBookings,
      approvedBookings, rejectedBookings, inReviewsBookings, completedBookings
    ] = await Promise.all([
      // Users counts
      prisma.users.count(),
      prisma.users.count({ where: { role: 'admin' } }),
      prisma.users.count({ where: { role: 'user' } }),
      prisma.users.count({ where: { status: 'register' } }),
      prisma.users.count({ where: { status: 'login' } }),
      prisma.users.count({ where: { status: 'logout' } }),
      prisma.users.count({ where: { status: 'blocked' } }),
      prisma.users.count({ where: { verified: true } }),
      // Rooms counts
      prisma.rooms.count(),
      prisma.rooms.count({ where: { room_status: 'available' } }),
      prisma.rooms.count({ where: { room_status: 'unavailable' } }),
      prisma.rooms.count({ where: { room_status: 'booked' } }),
      // Bookings counts
      prisma.bookings.count(),
      prisma.bookings.count({ where: { booking_status: 'pending' } }),
      prisma.bookings.count({ where: { booking_status: 'cancel' } }),
      prisma.bookings.count({ where: { booking_status: 'approved' } }),
      prisma.bookings.count({ where: { booking_status: 'rejected' } }),
      prisma.bookings.count({ where: { booking_status: 'in_reviews' } }),
      prisma.bookings.count({ where: { booking_status: 'completed' } })
    ]);

    if (totalUsers === 0) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Sorry! Any user does not found'
      ));
    }

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Dashboard information get successful',
      {
        users_info: {
          total_users: totalUsers || 0,
          admin_role_user: adminRoleUsers || 0,
          user_role_user: userRoleUsers || 0,
          register_status_user: registerStatusUsers || 0,
          login_status_user: loginStatusUsers || 0,
          logout_status_user: logoutStatusUsers || 0,
          blocked_status_user: blockedStatusUsers || 0,
          verified_user: verifiedUsers || 0
        },
        rooms_info: {
          total_rooms: totalRooms || 0,
          available_rooms: availableRooms || 0,
          unavailable_rooms: unavailableRooms || 0,
          booked_rooms: bookedRooms || 0
        },
        booking_info: {
          total_bookings: totalBookings || 0,
          pending_bookings: pendingBookings || 0,
          cancel_bookings: cancelBookings || 0,
          approved_bookings: approvedBookings || 0,
          rejected_bookings: rejectedBookings || 0,
          in_reviews_bookings: inReviewsBookings || 0,
          completed_bookings: completedBookings || 0
        }
      }
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};
