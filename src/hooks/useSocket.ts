// src/hooks/useSocket.ts
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:4000"; // Match your socket server port

export const useSocket = (session: any) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session) {
      console.warn("No session provided to useSocket");
      return;
    }

    // Initialize socket only once
    if (!socketRef.current) {
      const newSocket = io(SOCKET_SERVER_URL, {
        path: "/api/socket.io",
        auth: {
          session, // Pass session for auth middleware on server
        },
        transports: ["websocket"], // Optional: force websocket
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [session]);

  return { socket, isConnected };
};