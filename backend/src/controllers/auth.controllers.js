/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

const fs = require('fs');
const crypto = require('crypto');
const appRoot = require('app-root-path');
const prisma = require('../database/connect.postgres.db');
const logger = require('../middleware/winston.logger');
const { errorResponse, successResponse } = require('../configs/app.response');
const loginResponse = require('../configs/login.response');
const sendEmail = require('../configs/send.mail');
const {
  hashPassword, comparePassword, getResetPasswordToken,
  getEmailVerificationToken, sanitizeUserName, getJWTToken, getJWTRefreshToken
} = require('../services/user.service');

// TODO: Controller for registration new user
exports.register = async (req, res) => {
  try {
    const {
      userName, fullName, email, phone, password, dob, address, gender, role
    } = req.body;

    if (userName && fullName && email && password && dob && address) {
      // check if userName, email or phone already exists
      const findUserName = await prisma.users.findUnique({ where: { userName } });
      const findEmail = await prisma.users.findUnique({ where: { email } });

      if (findUserName) {
        // delete uploaded avatar image
        if (req?.file?.filename) {
          fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
            if (err) { logger.error(err); }
          });
        }

        return res.status(409).json(errorResponse(
          9,
          'ALREADY EXIST',
          'Sorry, Username already exists'
        ));
      }

      if (findEmail) {
        // delete uploaded avatar image
        if (req?.file?.filename) {
          fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
            if (err) { logger.error(err); }
          });
        }

        return res.status(409).json(errorResponse(
          9,
          'ALREADY EXIST',
          'Sorry, Email already exists'
        ));
      }

      if (phone) {
        const findPhone = await prisma.users.findUnique({ where: { phone } });
        if (findPhone) {
          // delete uploaded avatar image
          if (req?.file?.filename) {
            fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
              if (err) { logger.error(err); }
            });
          }

          return res.status(409).json(errorResponse(
            9,
            'ALREADY EXIST',
            'Sorry, Phone number already exists'
          ));
        }
      }

      // hash password before storing
      const hashedPassword = await hashPassword(password);

      // sanitize userName (replace spaces with dashes)
      const sanitizedUserName = sanitizeUserName(userName);

      // create new user and store in database
      const user = await prisma.users.create({
        data: {
          userName: sanitizedUserName,
          fullName,
          email,
          phone: phone || null,
          password: hashedPassword,
          avatar: req.file ? `/uploads/users/${req.file.filename}` : '/avatar.png',
          gender: gender || null,
          dob: new Date(dob),
          address,
          role: role || 'user'
        }
      });

      // success response with register new user
      res.status(201).json(successResponse(
        0,
        'SUCCESS',
        'User registered successful',
        {
          userName: user.userName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          avatar: process.env.APP_BASE_URL + user.avatar,
          gender: user.gender,
          dob: user.dob,
          address: user.address,
          role: user.role,
          verified: user.verified,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      ));
    } else {
      // delete uploaded avatar image
      if (req?.file?.filename) {
        fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
          if (err) { logger.error(err); }
        });
      }

      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter all required fields'
      ));
    }
  } catch (error) {
    // delete uploaded avatar image
    if (req?.file?.filename) {
      fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
        if (err) { logger.error(err); }
      });
    }

    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for login existing user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { loginType } = req.query;

    // check if email or password is empty
    if (!email || !password) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter email and password'
      ));
    }

    // check user already exists (include password for comparison)
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // if query loginType is "admin"
    if (loginType === 'admin') {
      if (user.role !== 'admin') {
        return res.status(406).json(errorResponse(
          6,
          'UNABLE TO ACCESS',
          'Accessing the page or resource you were trying to reach is forbidden'
        ));
      }
    }

    // check if user is "blocked"
    if (user.status === 'blocked') {
      return res.status(406).json(errorResponse(
        6,
        'UNABLE TO ACCESS',
        'Accessing the page or resource you were trying to reach is forbidden'
      ));
    }

    // check password matched
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'User credentials are incorrect'
      ));
    }

    // update user status & updateAt time
    const logUser = await prisma.users.update({
      where: { id: user.id },
      data: { status: 'login' }
    });

    // response user with JWT access token token
    loginResponse(res, logUser);
  } catch (error) {
    res.status(500).json(errorResponse(
      1,
      'FAILED',
      error
    ));
  }
};

// TODO: Controller for logout user
exports.logoutUser = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Unauthorized access. Please login to continue'
      ));
    }

    // update user status & updateAt time
    await prisma.users.update({
      where: { id: user.id },
      data: { status: 'logout' }
    });

    // remove cookie
    res.clearCookie('AccessToken');

    // response user
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'User logged out successful'
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // reset password token
    const { resetToken, resetPasswordToken, resetPasswordExpire } = getResetPasswordToken();

    // save update user
    await prisma.users.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetPasswordExpire }
    });

    // re-fetch user with updated token fields for sendEmail
    const updatedUser = await prisma.users.findUnique({ where: { id: user.id } });

    // mailing data
    const url = `${process.env.APP_SERVICE_URL}/auth/forgot-password/${resetToken}`;
    const subjects = 'Password Recovery Email';
    const message = 'Click below link to reset your password. If you have not requested this email simply ignore this email.';
    const title = 'Recovery Your Password';

    // sending mail
    sendEmail(res, updatedUser, url, subjects, message, title);
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user reset password
exports.resetPassword = async (req, res) => {
  try {
    if (req.params.token && req.body.password && req.body.confirmPassword) {
      // creating token crypto hash
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await prisma.users.findFirst({
        where: {
          resetPasswordToken,
          resetPasswordExpire: { gt: new Date() }
        }
      });

      if (!user) {
        return res.status(404).json(errorResponse(
          4,
          'UNKNOWN ACCESS',
          'Reset Password Token is invalid or has been expired'
        ));
      }

      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          'Password and Confirm password does not match'
        ));
      }

      // hash the new password
      const hashedPassword = await hashPassword(req.body.password);

      // reset user password in database
      await prisma.users.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpire: null
        }
      });

      res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'User password reset successful'
      ));
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter all required fields'
      ));
    }
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user change password
exports.changePassword = async (req, res) => {
  try {
    if (req.body.oldPassword && req.body.newPassword) {
      const { user } = req;

      if (!user) {
        return res.status(404).json(errorResponse(
          4,
          'UNKNOWN ACCESS',
          'User does not exist'
        ));
      }

      // fetch user with password (middleware doesn't include it by default in Prisma either,
      // but Prisma returns all scalar fields unless explicitly selected)
      const userWithPassword = await prisma.users.findUnique({ where: { id: user.id } });

      // check old password matched
      const isPasswordMatch = await comparePassword(
        req.body.oldPassword.toString(),
        userWithPassword.password
      );
      if (!isPasswordMatch) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          'User credentials are incorrect'
        ));
      }

      // hash new password
      const hashedPassword = await hashPassword(req.body.newPassword);

      // change user password in database
      await prisma.users.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'User password reset successful'
      ));
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter all required fields'
      ));
    }
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user email verification link send
exports.sendEmailVerificationLink = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // check user already verified
    if (user.verified) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Ops! Your mail already verified'
      ));
    }

    // email verification token
    const { verificationToken, emailVerificationToken, emailVerificationExpire } = getEmailVerificationToken();

    // save updated user
    await prisma.users.update({
      where: { id: user.id },
      data: { emailVerificationToken, emailVerificationExpire }
    });

    // re-fetch user with updated fields
    const updatedUser = await prisma.users.findUnique({ where: { id: user.id } });

    // mailing data
    const url = `${process.env.APP_SERVICE_URL}/auth/verify-email/${verificationToken}`;
    const subjects = 'User Email Verification';
    const message = 'Click below link to verify your email. If you have not requested this email simply ignore this email.';
    const title = 'Verify Your Email';

    // sending mail
    sendEmail(res, updatedUser, url, subjects, message, title);
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user email verification
exports.emailVerification = async (req, res) => {
  try {
    if (req.params.token) {
      // creating token crypto hash
      const emailVerificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await prisma.users.findFirst({
        where: {
          emailVerificationToken,
          emailVerificationExpire: { gt: new Date() }
        }
      });

      if (!user) {
        return res.status(404).json(errorResponse(
          4,
          'UNKNOWN ACCESS',
          'Email verification token is invalid or has been expired'
        ));
      }

      // verify user email in database
      await prisma.users.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationExpire: null,
          verified: true
        }
      });

      res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'User email verification successful'
      ));
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter all required fields'
      ));
    }
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    const accessToken = getJWTToken(user);
    const refreshToken = getJWTRefreshToken(user);

    // options for cookie
    const options = {
      expires: new Date(Date.now() + process.env.JWT_TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      httpOnly: true
    };

    res
      .status(200)
      .cookie('AccessToken', accessToken, options)
      .json(successResponse(
        0,
        'SUCCESS',
        'JWT refreshToken generate successful',
        { accessToken, refreshToken }
      ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};
