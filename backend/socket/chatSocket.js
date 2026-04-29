const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Message, User } = require('../models');
const { getAccessibleBooking } = require('../utils/chatAccess');

function serializeMessage(message) {
  return {
    id: message.id,
    bookingId: message.bookingId,
    senderId: message.senderId,
    message: message.message,
    readAt: message.readAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    sender: message.sender,
  };
}

function setupChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on('join_booking_chat', async ({ bookingId }, ack) => {
      try {
        const booking = await getAccessibleBooking(bookingId, socket.user);
        if (!booking) {
          ack?.({ success: false, message: 'Chat not found' });
          return;
        }

        socket.join(`booking:${booking.id}`);
        ack?.({ success: true });
      } catch (err) {
        ack?.({ success: false, message: err.message });
      }
    });

    socket.on('send_booking_message', async ({ bookingId, message }, ack) => {
      try {
        const cleanMessage = String(message || '').trim();
        if (!cleanMessage) {
          ack?.({ success: false, message: 'Message is required' });
          return;
        }

        const booking = await getAccessibleBooking(bookingId, socket.user);
        if (!booking) {
          ack?.({ success: false, message: 'Chat not found' });
          return;
        }

        const saved = await Message.create({
          bookingId: booking.id,
          senderId: socket.user.id,
          message: cleanMessage,
        });

        const fullMessage = await Message.findByPk(saved.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
        });

        const payload = serializeMessage(fullMessage);
        const recipientId =
          String(booking.userId) === String(socket.user.id)
            ? booking.provider?.userId
            : booking.userId;

        io.to(`booking:${booking.id}`).emit('booking_message', payload);
        if (recipientId) {
          io.to(`user:${recipientId}`).emit('chat_unread', {
            bookingId: booking.id,
            message: payload,
          });
        }
        ack?.({ success: true, message: payload });
      } catch (err) {
        ack?.({ success: false, message: err.message });
      }
    });

    socket.on('mark_booking_read', async ({ bookingId }, ack) => {
      try {
        const booking = await getAccessibleBooking(bookingId, socket.user);
        if (!booking) {
          ack?.({ success: false, message: 'Chat not found' });
          return;
        }

        const readAt = new Date();
        await Message.update(
          { readAt },
          {
            where: {
              bookingId: booking.id,
              senderId: { [Op.ne]: socket.user.id },
              readAt: null,
            },
          },
        );

        io.to(`booking:${booking.id}`).emit('booking_messages_read', {
          bookingId: booking.id,
          readerId: socket.user.id,
          readAt,
        });
        io.to(`user:${socket.user.id}`).emit('chat_read', { bookingId: booking.id });
        ack?.({ success: true, bookingId: booking.id, readAt });
      } catch (err) {
        ack?.({ success: false, message: err.message });
      }
    });
  });
}

module.exports = setupChatSocket;
