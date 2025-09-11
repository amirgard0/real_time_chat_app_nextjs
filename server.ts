// server/socket-server.ts
import { Server } from "socket.io";
import http from "http";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const port = 4000; // Different port than Next.js (3000)
const httpServer = http.createServer(); // No need to handle Next.js requests here

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Allow Next.js frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/api/socket.io",
});

io.use(async (socket, next) => {
  const session = socket.handshake.auth.session;
  if (!session) {
    return next(new Error("no session error -> server"));
  }

  // Attach user info to socket (you can expand this based on your auth system)
  socket.data.userSession = session;
  socket.data.userId = session.user?.id; // Adjust based on your session structure
  socket.data.user = session.user;

  next();
});

io.on("connection", async (socket) => {
  const userId = socket.data.userId;
  const userName = socket.data.user?.name || "Anonymous";

  console.log("User connected:", userId);

  // Join global room
  socket.join("global");

  // Send recent messages on join
  try {
    const messages = await prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
    socket.emit("recentMessages", messages.reverse());
  } catch (error) {
    console.error("Failed to load recent messages:", error);
  }

  socket.on("sendMessage", async (msg) => {
    try {
      const message = await prisma.message.create({
        data: {
          content: msg.content,
          userId: userId,
        },
      });

      io.to("global").emit("newMessage", {
        id: message.id,
        content: message.content,
        userId: message.userId,
        user: { name: userName },
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
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