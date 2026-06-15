/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

const sgMail = require('@sendgrid/mail');
const { successResponse, errorResponse } = require('./app.response');
const prisma = require('../database/connect.postgres.db');

const sendEmail = async (res, user, url, subjects, message, title) => {
  sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

  const msg = {
    to: user.email,
    from: process.env.SEND_SENDER_MAIL,
    subject: subjects,
    text: message,
    html: `<div>
      <h4>${title}</h4>
      <a href="${url}" target="_blank"> >>> Click Here</a>
    </div>`
  };

  await sgMail.send(msg).then(() => {
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      `Email sent to ${user.email} successful`
    ));
  }).catch(async (error) => {
    // Clear any pending token fields on mail failure
    await prisma.users.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpire: null,
        emailVerificationToken: null,
        emailVerificationExpire: null
      }
    });

    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  });
};

module.exports = sendEmail;
