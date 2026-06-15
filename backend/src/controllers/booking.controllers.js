/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

const prisma = require('../database/connect.postgres.db');
const { errorResponse, successResponse } = require('../configs/app.response');
const MyQueryHelper = require('../configs/api.feature');
const { bookingDatesBeforeCurrentDate } = require('../lib/booking.dates.validator');
const { isValidUUID, bookingStatusToApi, bookingStatusFromApi } = require('../lib/validators');

// TODO: controller for placed booking order
exports.placedBookingOrder = async (req, res) => {
  try {
    // finding by room id
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably room id missing/incorrect'
      ));
    }

    const myRoom = await prisma.rooms.findUnique({ where: { id: req.params.id } });

    // check room available
    if (!myRoom) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Room does not exist'
      ));
    }

    // check room status is`unavailable`
    if (myRoom.room_status === 'unavailable') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Sorry! Current your sleeted room can\'t available'
      ));
    }

    // check room status is `booked`
    if (myRoom.room_status === 'booked') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Sorry! Current your sleeted already booked. Please try again later'
      ));
    }

    // save booking data in database
    const booking = await prisma.bookings.create({
      data: {
        room_id: req.params.id,
        booking_dates: req.body.booking_dates.map((d) => new Date(d)),
        booking_by_id: req.user.id
      }
    });

    // Map booking_status for API response
    const responseBooking = {
      ...booking,
      booking_status: bookingStatusToApi(booking.booking_status)
    };

    // success response with register new user
    res.status(201).json(successResponse(
      0,
      'SUCCESS',
      'Your room booking order placed successful. Please wait for confirmation.',
      responseBooking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for get all specific user booking order
exports.getBookingOrderByUserId = async (req, res) => {
  try {
    const bookingInclude = {
      room: { include: { room_images: true } },
      booking_by: true,
      reviews: { include: { user: true } }
    };

    const myBooking = await prisma.bookings.findMany({
      where: { booking_by_id: req.user.id },
      include: bookingInclude
    });

    // if no bookings found, return an empty array with 200 OK
    if (!myBooking || myBooking.length === 0) {
      return res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'No bookings found',
        {
          rows: [],
          total_rows: 0,
          response_rows: 0,
          total_page: 0,
          current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
        }
      ));
    }

    // filtering booking orders based on different types query
    const queryHelper = new MyQueryHelper(req.query).sort().paginate();
    const queryOptions = queryHelper.getQueryOptions({ booking_by_id: req.user.id });
    const findBooking = await prisma.bookings.findMany({
      ...queryOptions,
      include: bookingInclude
    });

    const mapperBooking = findBooking?.map((data) => ({
      id: data?.id,
      booking_dates: data?.booking_dates,
      booking_status: bookingStatusToApi(data?.booking_status),
      reviews: !data?.reviews ? null : {
        id: data?.reviews.id,
        room_id: data?.reviews.room_id,
        booking_id: data?.reviews.booking_id,
        rating: data?.reviews.rating,
        message: data?.reviews.message,
        reviews_by: {
          id: data?.reviews?.user?.id,
          userName: data?.reviews?.user?.userName,
          fullName: data?.reviews?.user?.fullName,
          email: data?.reviews?.user?.email,
          phone: data?.reviews?.user?.phone,
          avatar: process.env.APP_BASE_URL + data?.reviews?.user?.avatar,
          gender: data?.reviews?.user?.gender,
          dob: data?.reviews?.user?.dob,
          address: data?.reviews?.user?.address,
          role: data?.reviews?.user?.role,
          verified: data?.reviews?.user?.verified,
          status: data?.reviews?.user?.status,
          createdAt: data?.reviews?.user?.createdAt,
          updatedAt: data?.reviews?.user?.updatedAt
        },
        created_at: data?.reviews?.createdAt,
        updated_at: data?.reviews?.updatedAt
      },
      booking_by: {
        id: data?.booking_by?.id,
        userName: data?.booking_by?.userName,
        fullName: data?.booking_by?.fullName,
        email: data?.booking_by?.email,
        phone: data?.booking_by?.phone,
        avatar: process.env.APP_BASE_URL + data?.booking_by?.avatar,
        gender: data?.booking_by?.gender,
        dob: data?.booking_by?.dob,
        address: data?.booking_by?.address,
        role: data?.booking_by?.role,
        verified: data?.booking_by?.verified,
        status: data?.booking_by?.status,
        createdAt: data?.booking_by?.createdAt,
        updatedAt: data?.booking_by?.updatedAt
      },
      room: {
        id: data?.room?.id,
        room_name: data?.room?.room_name,
        room_slug: data?.room?.room_slug,
        room_type: data?.room?.room_type,
        room_price: data?.room?.room_price,
        room_size: data?.room?.room_size,
        room_capacity: data?.room?.room_capacity,
        allow_pets: data?.room?.allow_pets,
        provide_breakfast: data?.room?.provide_breakfast,
        featured_room: data?.room?.featured_room,
        room_description: data?.room?.room_description,
        room_status: data?.room?.room_status,
        extra_facilities: data?.room?.extra_facilities,
        room_images: data?.room?.room_images?.map(
          (img) => ({ url: process.env.APP_BASE_URL + img.url })
        )
      },
      created_at: data?.createdAt,
      updated_at: data?.updatedAt
    }));

    // success response with the booking list
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking list retrieved successful',
      {
        rows: mapperBooking,
        total_rows: myBooking.length,
        response_rows: findBooking.length,
        total_page: req?.query?.keyword ? Math.ceil(findBooking.length / req.query.limit) : Math.ceil(myBooking.length / req.query.limit),
        current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
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

// TODO: controller for cancel self booking order
exports.cancelSelfBookingOrder = async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    // find the booking by id and check if the booking_by user id matches the authenticated user id
    const booking = await prisma.bookings.findFirst({
      where: { id: req.params.id, booking_by_id: req.user.id }
    });

    // if booking not found or user is not authorized to cancel this booking, return an error response
    if (!booking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking not found or you are not authorized to cancel this booking'
      ));
    }

    // if booking status is not 'pending', return an error response
    if (booking.booking_status !== 'pending') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'This booking cannot be `cancel` as it is no longer in the `pending` status'
      ));
    }

    // update the booking status to 'cancel'
    const updatedBooking = await prisma.bookings.update({
      where: { id: booking.id },
      data: { booking_status: 'cancel' }
    });

    // Map booking_status for API response
    const responseBooking = {
      ...updatedBooking,
      booking_status: bookingStatusToApi(updatedBooking.booking_status)
    };

    // success response after canceling the booking
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking order has been canceled successful',
      responseBooking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for get all booking order by admin
exports.getBookingOrderForAdmin = async (req, res) => {
  try {
    const bookingInclude = {
      room: { include: { room_images: true } },
      booking_by: true,
      reviews: { include: { user: true } }
    };

    const myBooking = await prisma.bookings.findMany({
      include: bookingInclude
    });

    // if no bookings found, return an empty array with 200 OK
    if (!myBooking || myBooking.length === 0) {
      return res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'No bookings found',
        {
          rows: [],
          total_rows: 0,
          response_rows: 0,
          total_page: 0,
          current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
        }
      ));
    }

    // filtering booking orders based on different types query
    const queryHelper = new MyQueryHelper(req.query).sort().paginate();
    const queryOptions = queryHelper.getQueryOptions();
    const findBooking = await prisma.bookings.findMany({
      ...queryOptions,
      include: bookingInclude
    });

    const mapperBooking = findBooking?.map((data) => ({
      id: data?.id,
      booking_dates: data?.booking_dates,
      booking_status: bookingStatusToApi(data?.booking_status),
      reviews: !data?.reviews ? null : {
        id: data?.reviews.id,
        room_id: data?.reviews.room_id,
        booking_id: data?.reviews.booking_id,
        rating: data?.reviews.rating,
        message: data?.reviews.message,
        reviews_by: {
          id: data?.reviews?.user?.id,
          userName: data?.reviews?.user?.userName,
          fullName: data?.reviews?.user?.fullName,
          email: data?.reviews?.user?.email,
          phone: data?.reviews?.user?.phone,
          avatar: process.env.APP_BASE_URL + data?.reviews?.user?.avatar,
          gender: data?.reviews?.user?.gender,
          dob: data?.reviews?.user?.dob,
          address: data?.reviews?.user?.address,
          role: data?.reviews?.user?.role,
          verified: data?.reviews?.user?.verified,
          status: data?.reviews?.user?.status,
          createdAt: data?.reviews?.user?.createdAt,
          updatedAt: data?.reviews?.user?.updatedAt
        },
        created_at: data?.reviews?.createdAt,
        updated_at: data?.reviews?.updatedAt
      },
      booking_by: {
        id: data?.booking_by?.id,
        userName: data?.booking_by?.userName,
        fullName: data?.booking_by?.fullName,
        email: data?.booking_by?.email,
        phone: data?.booking_by?.phone,
        avatar: process.env.APP_BASE_URL + data?.booking_by?.avatar,
        gender: data?.booking_by?.gender,
        dob: data?.booking_by?.dob,
        address: data?.booking_by?.address,
        role: data?.booking_by?.role,
        verified: data?.booking_by?.verified,
        status: data?.booking_by?.status,
        createdAt: data?.booking_by?.createdAt,
        updatedAt: data?.booking_by?.updatedAt
      },
      room: {
        id: data?.room?.id,
        room_name: data?.room?.room_name,
        room_slug: data?.room?.room_slug,
        room_type: data?.room?.room_type,
        room_price: data?.room?.room_price,
        room_size: data?.room?.room_size,
        room_capacity: data?.room?.room_capacity,
        allow_pets: data?.room?.allow_pets,
        provide_breakfast: data?.room?.provide_breakfast,
        featured_room: data?.room?.featured_room,
        room_description: data?.room?.room_description,
        room_status: data?.room?.room_status,
        extra_facilities: data?.room?.extra_facilities,
        room_images: data?.room?.room_images?.map(
          (img) => ({ url: process.env.APP_BASE_URL + img.url })
        )
      },
      created_at: data?.createdAt,
      updated_at: data?.updatedAt
    }));

    // success response with the booking list
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking list retrieved successful',
      {
        rows: mapperBooking,
        total_rows: myBooking.length,
        response_rows: findBooking.length,
        total_page: req?.query?.keyword ? Math.ceil(findBooking.length / req.query.limit) : Math.ceil(myBooking.length / req.query.limit),
        current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
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

// TODO: controller for updated booking order by admin
exports.updatedBookingOrderByAdmin = async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    // find the booking by id
    const booking = await prisma.bookings.findUnique({ where: { id: req.params.id } });

    // if booking not found, return an error response
    if (!booking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking not found or you are not authorized to cancel this booking'
      ));
    }

    // check `booking_status` filed exits
    if (!req.body.booking_status) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`booking_status` filed is required'
      ));
    }

    // finding room by room id
    const myRoom = await prisma.rooms.findUnique({ where: { id: booking.room_id } });

    // check room available
    if (!myRoom) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Room does not exist'
      ));
    }

    // Convert API booking_status to Prisma enum value
    const requestedStatus = bookingStatusFromApi(req.body.booking_status);
    let updatedBooking;

    // handle update booking status
    switch (requestedStatus) {
      case 'approved':
        if (booking.booking_status === 'pending') {
          if (!bookingDatesBeforeCurrentDate(booking?.booking_dates).isAnyDateInPast) {
            // update the booking status to `approved`
            updatedBooking = await prisma.bookings.update({
              where: { id: booking.id },
              data: { booking_status: 'approved' }
            });

            // update the room status to 'booked'
            await prisma.rooms.update({
              where: { id: myRoom.id },
              data: { room_status: 'booked' }
            });
          } else {
            return res.status(400).json(errorResponse(
              1,
              'FAILED',
              'Sorry! This booking cannot be `approved` because of booking data is past'
            ));
          }
        } else {
          return res.status(400).json(errorResponse(
            1,
            'FAILED',
            'This booking cannot be `approved` as it is no longer in the `pending` status'
          ));
        }
        break;
      case 'rejected':
        if (booking.booking_status === 'pending') {
          // update the booking status to `rejected`
          updatedBooking = await prisma.bookings.update({
            where: { id: booking.id },
            data: { booking_status: 'rejected' }
          });
        } else {
          return res.status(400).json(errorResponse(
            1,
            'FAILED',
            'This booking cannot be `rejected` as it is no longer in the `pending` status'
          ));
        }
        break;
      case 'in_reviews':
        if (booking.booking_status === 'approved') {
          if (bookingDatesBeforeCurrentDate(booking?.booking_dates).isAnyDateInPast) {
            // update the booking status to `in_reviews`
            updatedBooking = await prisma.bookings.update({
              where: { id: booking.id },
              data: { booking_status: 'in_reviews' }
            });

            // update the room status to 'available'
            await prisma.rooms.update({
              where: { id: myRoom.id },
              data: { room_status: 'available' }
            });
          } else {
            return res.status(400).json(errorResponse(
              1,
              'FAILED',
              'Sorry! This booking cannot be `in-reviews` because of booking data is not feature'
            ));
          }
        } else {
          return res.status(400).json(errorResponse(
            1,
            'FAILED',
            'This booking cannot be `in-reviews` as it is no longer in the `approved` status'
          ));
        }
        break;
      default:
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          `Your provided booking_status '${req.body.booking_status}' can't match our system. Please try again using a correct booking_status`
        ));
    }

    // Map booking_status for API response
    const responseBooking = {
      ...updatedBooking,
      booking_status: bookingStatusToApi(updatedBooking.booking_status)
    };

    // success response after updating the booking
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      `Booking order has been '${bookingStatusToApi(updatedBooking.booking_status)}' successful`,
      responseBooking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};
