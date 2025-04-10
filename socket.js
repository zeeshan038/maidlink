const socketIO = require('socket.io');

module.exports = (server) => {
  const io = socketIO(server);

  const userSocketMap = new Map();

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    userSocketMap.set(userId, socket.id);

    console.log(`✅ User connected: ${userId} (${socket.id})`);

    socket.on("private-message", ({ toUserId, message }) => {
      const targetSocketId = userSocketMap.get(toUserId);

      console.log(`📨 ${userId} ➡️ ${toUserId}: ${message}`);

      if (targetSocketId) {
        io.to(targetSocketId).emit("received-message", {
          fromUserId: userId,
          message,
        });
      } else {
        console.log(`⚠️ User ${toUserId} is not connected`);
      }
    });

    socket.onAny((event, data) => {
      if (event !== 'private-message') {
        console.log(`🔄 Raw event received (${event}):`, data);
      }
    });

    // On disconnect
    socket.on('disconnect', () => {
      console.log(`❌ ${userId} disconnected`);
      userSocketMap.delete(userId);
    });
  });

  return io;
};
