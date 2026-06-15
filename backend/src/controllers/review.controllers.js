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
const { isValidUUID, bookingStatusToApi } = require('../lib/validators');

// TODO: controller for room review add
exports.roomReviewAdd = async (req, res) => {
  try {
    const { rating, message } = req.body;

    // check `rating` filed exits
    if (!rating) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`rating` filed is required'
      ));
    }

    // check `message` filed exits
    if (!message) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`message` filed is required'
      ));
    }

    // finding by a booking by id
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    const myBooking = await prisma.bookings.findUnique({
      where: { id: req.params.id },
      include: { reviews: true }
    });

    // check room available
    if (!myBooking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking does not exist'
      ));
    }

    // check booking already add reviews
    if (myBooking.reviews) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Sorry! This booking already add an review'
      ));
    }

    // check booking status is `in-reviews` (stored as 'in_reviews' in Prisma)
    if (myBooking.booking_status !== 'in_reviews') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Invalid booking status for adding a review'
      ));
    }

    // create a user new room review
    const savedReview = await prisma.reviews.create({
      data: {
        user_id: req.user.id,
        room_id: myBooking.room_id,
        booking_id: req.params.id,
        rating: parseInt(rating, 10),
        message
      }
    });

    // update the booking status to 'completed'
    await prisma.bookings.update({
      where: { id: myBooking.id },
      data: { booking_status: 'completed' }
    });

    // success response with register new user
    res.status(201).json(successResponse(
      0,
      'SUCCESS',
      'Your room booking order placed successful',
      savedReview
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for get an room reviews list
exports.getRoomReviewsList = async (req, res) => {
  try {
    if (!isValidUUID(req.params.room_id)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    // finding reviews by room_id
    const myReviews = await prisma.reviews.findMany({
      where: { room_id: req.params.room_id },
      include: { user: true }
    });

    // check review available
    if (!myReviews || myReviews.length === 0) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Review does not exist'
      ));
    }

    // filtering reviews based on different types query
    const queryHelper = new MyQueryHelper(req.query).sort().paginate();
    const queryOptions = queryHelper.getQueryOptions({ room_id: req.params.room_id });
    const findReviews = await prisma.reviews.findMany({
      ...queryOptions,
      include: { user: true }
    });

    const mapperReviews = findReviews?.map((data) => ({
      id: data?.id,
      rating: data?.rating,
      message: data?.message,
      room_id: data?.room_id,
      booking_id: data?.booking_id,
      reviews_by: {
        id: data?.user?.id,
        userName: data?.user?.userName,
        fullName: data?.user?.fullName,
        email: data?.user?.email,
        phone: data?.user?.phone,
        avatar: process.env.APP_BASE_URL + data?.user?.avatar,
        gender: data?.user?.gender,
        dob: data?.user?.dob,
        address: data?.user?.address,
        role: data?.user?.role,
        verified: data?.user?.verified,
        status: data?.user?.status,
        createdAt: data?.user?.createdAt,
        updatedAt: data?.user?.updatedAt
      },
      created_at: data?.createdAt,
      updated_at: data?.updatedAt
    }));

    // success response with the reviews list
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Reviews list retrieved successful',
      {
        rows: mapperReviews,
        total_rows: myReviews.length,
        response_rows: findReviews.length,
        total_page: req?.query?.keyword ? Math.ceil(findReviews.length / req.query.limit) : Math.ceil(myReviews.length / req.query.limit),
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

// TODO: controller for edit self room review
exports.editSelfRoomReview = async (req, res) => {
  try {
    const { rating, message } = req.body;

    // check `rating` filed exits
    if (!rating) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`rating` filed is required'
      ));
    }

    // check `message` filed exits
    if (!message) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`message` filed is required'
      ));
    }

    // finding by a review by id
    if (!isValidUUID(req.params.review_id)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    const myReviews = await prisma.reviews.findUnique({
      where: { id: req.params.review_id },
      include: { user: true }
    });

    // check review available
    if (!myReviews) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Review does not exist'
      ));
    }

    if (myReviews?.user?.id !== req?.user?.id) {
      return res.status(406).json(errorResponse(
        6,
        'UNABLE TO ACCESS',
        'Sorry! You can update only self room reviews'
      ));
    }

    // update review info & save database
    const updatedReview = await prisma.reviews.update({
      where: { id: req.params.review_id },
      data: { rating: parseInt(rating, 10), message }
    });

    // success response with the update review
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Your room review update successful',
      updatedReview
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};
