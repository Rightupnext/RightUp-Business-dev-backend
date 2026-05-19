import { Server } from "socket.io";

let io;

export const initSocket = (server) => {

  io = new Server(server, {

    cors: {
      origin: "*",
      methods: [
        "GET",
        "POST",
        "PATCH",
        "DELETE",
      ],
      credentials: true,
    },

    transports: [
      "websocket",
      "polling",
    ],
  });

  io.on("connection", (socket) => {

    console.log(
      "✅ Socket Connected:",
      socket.id
    );

    // USER ROOM
    socket.on("join", (userId) => {

      socket.join(userId);

      console.log(
        `👤 User Joined: ${userId}`
      );
    });

    // PROJECT ROOM
    socket.on(
      "joinProject",
      (projectId) => {

        socket.join(projectId);

        console.log(
          `📁 Project Joined: ${projectId}`
        );
      }
    );

    socket.on("disconnect", () => {

      console.log(
        "❌ Socket Disconnected"
      );
    });
  });

  return io;
};

export const getIO = () => {

  if (!io) {

    throw new Error(
      "Socket.io not initialized"
    );
  }

  return io;
};