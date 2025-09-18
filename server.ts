// server.ts
import { Server } from "socket.io";
import http from "http";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const port = 4000;
const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/api/socket.io",
});

io.use(async (socket, next) => {
  const session = socket.handshake.auth.session;
  if (!session || !session.user?.id) {
    return next(new Error("No valid session provided"));
  }

  // Attach user info to socket data for later use
  socket.data.userSession = session;
  socket.data.userId = session.user.id;
  socket.data.userName = session.user.name || "Anonymous";
  socket.data.currentRoom = "global"; // 👈 Track current room per socket

  next();
});

io.on("connection", async (socket) => {
  const userId = socket.data.userId;
  const userName = socket.data.userName;

  console.log(`User connected: ${userId} (${userName})`);
  // await prisma.user.update({
  //   where: {
  //     id: userId
  //   },
  //   data: {
  //     lastSeen: new Date(Date.now()),
  //     isOnline: true
  //   }
  // })
  // console.log("update done")

  prisma.user.update({
    where: {
      id: userId
    },
    data: {
      lastSeen: new Date(Date.now()),
      isOnline: true
    }
  })

  // Join global room by default
  socket.join("global");


  // Send recent global messages on connect
  socket.on("globalMessages", async () => {
    try {
      const messages = await prisma.message.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        where: { group: { name: "global" } },
        include: { user: { select: { name: true } } },
      });
      socket.emit("recentMessages", messages.reverse());
    } catch (error) {
      console.error("Failed to load initial global messages:", error);
    }
  })

  // =====================
  // 📩 Events
  // =====================

  // Join a specific group
  socket.on("joinGroup", async (groupId, callback) => {
    try {
      const group = await prisma.group.findUniqueOrThrow({
        where: { id: groupId },
        select: { id: true, name: true },
      });

      if (!group) {
        socket.emit("error", { message: "Group not found" });
        callback({ status: "not found" });
        return;
      }

      // Leave current room if different
      if (socket.data.currentRoom && socket.data.currentRoom !== groupId) {
        socket.leave(socket.data.currentRoom);
      }

      // Join new room
      socket.join(groupId);
      socket.data.currentRoom = groupId; // Update tracked room

      // Load recent messages
      const messages = await prisma.message.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        where: { groupId },
        include: { user: { select: { name: true } } },
      });

      socket.emit("recentMessages", messages.reverse());
      callback({ status: "ok" });
    } catch (error) {
      console.error("Error joining group:", error);
      socket.emit("error", { message: "Failed to join group" });
      callback({ status: "error" });
    }
  });

  // Join Private chat
  socket.on("joinPrivateChat", async (privateChatId, callback: (object: any) => void) => {
    try {
      // const privateChat = await prisma.privateChat.upsert({
      //   where: {
      //     user1Id_user2Id: {
      //       user1Id: sortedIds[0],
      //       user2Id: sortedIds[1]
      //     }
      //   },
      //   create: {
      //     user1Id: sortedIds[0],
      //     user2Id: sortedIds[1]
      //   },
      //   update: {},
      // });
      if (!privateChatId) {
        throw new Error("no privateChatId received")
      }
      const privateChat = await prisma.privateChat.findUnique({
        where: {
          id: privateChatId
        }

      })
      if (!privateChat) {
        callback({ status: "not found" })
        throw new Error("no private chat found")
      }

      socket.leave(socket.data.currentRoom)
      socket.join("privateChat" + privateChatId)
      socket.data.currentRoom = "privateChat" + privateChatId

      const messages = await prisma.privateMessage.findMany({
        where: {
          chatId: privateChatId
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          sender: { select: { name: true, id: true } }
        },
        take: 100
      })

      callback({ status: "ok", messages: messages.reverse() })
    } catch (error) {
      console.error("error: " + error)
      socket.emit("error", { message: "Failed to join privatechat" })
      callback({ status: "error" })
    }

  })

  socket.on("sendPrivateMessage", async ({ content, privateChatId }, callback) => {
    try {
      const chat = await prisma.privateChat.findUnique({
        where: { id: privateChatId },
        include: { user1: true, user2: true },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      // Check if the user is part of this chat
      if (chat.user1Id !== userId && chat.user2Id !== userId) {
        throw new Error("User is not part of this chat");
      }

      const privateMessage = await prisma.privateMessage.create({
        data: {
          content: content,
          chatId: privateChatId,
          senderId: userId
        }
      })

      io.to("privateChat" + privateChatId).emit("newPrivateMessage", {
        id: privateMessage.id,
        content: privateMessage.content,
        user: { name: userName },
        createdAt: privateMessage.createdAt,
        privateChatId: privateChatId,
      })
      if (typeof callback === "function") {
        callback({ status: "ok" })
      }
    } catch (error) {
      console.error("Failed to send private message:", error);
      socket.emit("error", { message: "Failed to send private message" });
      if (typeof callback === "function") {
        callback({ status: "error" });
      }
    }

  })

  // Leave a group (called on cleanup/unmount)
  socket.on("leaveGroup", (groupId) => {
    if (socket.data.currentRoom === groupId) {
      socket.leave(groupId);
      socket.data.currentRoom = "global"; // Default back to global
      console.log(`${userName} left group: ${groupId}`);
    }
  });

  // Get group details (for UI display)
  socket.on("getGroup", async (groupId, callback) => {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { id: true, name: true },
      });
      callback(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      callback(null);
    }
  });

  // Send message
  const commandList = ["/clear", "/deleteGroup"];

  socket.on("sendMessage", async ({ content, groupId }, callback) => {
    if (commandList.includes(content)) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { creatorId: true },
      });
      if (!group || userId !== group.creatorId) {
        return;
      }
      if (content === "/clear") {
        await prisma.message.deleteMany({ where: { groupId } });
        console.log(`${userName} cleared messages in group: ${groupId}`);
      } else if (content === "/deleteGroup") {
        await prisma.group.delete({ where: { id: groupId } });
        socket.leave(groupId);
        socket.data.currentRoom = "global";
        socket.join("global");
        console.log(`${userName} deleted group: ${groupId}`);
      }
      prisma.message
        .findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          where: { group: { id: groupId } },
          include: { user: { select: { name: true } } },
        })
        .then((messages) => {
          socket.emit("command", messages.reverse());
        })
        .catch((error) => {
          console.error("Failed to load global messages:", error);
        });
      if (typeof callback === "function") {
        callback({ status: "ok" });
      }
      return;
    }

    try {
      const message = await prisma.message.create({
        data: { userId, content, groupId },
      });
      io.to(groupId).emit("newMessage", {
        id: message.id,
        content: message.content,
        userId: message.userId,
        user: { name: userName },
        createdAt: message.createdAt,
        groupId: groupId,
      });
      if (typeof callback === "function") {
        callback({ status: "ok" });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      socket.emit("error", { message: "Failed to send message" });
      if (typeof callback === "function") {
        callback({ status: "error" });
      }
    }
  });

  // Create a new group
  socket.on("createGroup", async (groupName: string) => {
    try {
      const createdGroup = await prisma.group.create({
        data: {
          name: groupName.trim(),
          creatorId: userId,
        },
      });

      // Auto-join the creator
      if (socket.data.currentRoom !== createdGroup.id) {
        socket.leave(socket.data.currentRoom);
        socket.join(createdGroup.id);
        socket.data.currentRoom = createdGroup.id;
      }

      io.emit("groupCreated", createdGroup); // Notify everyone of new group (optional)
    } catch (error) {
      console.error("Failed to create group:", error);
      socket.emit("error", { message: "Failed to create group" });
    }
  });

  // Join global room explicitly
  socket.on("joinGlobal", () => {
    if (socket.data.currentRoom !== "global") {
      socket.leave(socket.data.currentRoom);
      socket.join("global");
      socket.data.currentRoom = "global";
      console.log(`${userName} switched to global chat`);
    }

    // Load recent global messages
    prisma.message
      .findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        where: { group: { name: "global" } },
        include: { user: { select: { name: true } } },
      })
      .then((messages) => {
        socket.emit("recentMessages", messages.reverse());
      })
      .catch((error) => {
        console.error("Failed to load global messages:", error);
      });
  });

  // =====================
  // 💥 Disconnect
  // =====================
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId} (${userName})`);
    if (socket.data.currentRoom !== "global") {
      console.log(`Left room: ${socket.data.currentRoom}`);
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: false
      }
    })
  });
});

httpServer.listen(port, () => {
  console.log(`> Socket.IO server running on ws://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down Socket.IO server...");
  await prisma.$disconnect();
  process.exit(0);
});