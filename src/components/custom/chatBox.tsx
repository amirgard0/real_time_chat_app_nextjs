// src/components/custom/chatBox.tsx
import { useEffect, useRef } from "react";
import { MessageBubble } from "./messageBubble";
import { MessageCircle } from "lucide-react";

export const ChatBox = ({ messages, username }: { messages: any[]; username: string; }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);
  return (
    <div
      ref={chatRef}
      className="h-full p-6 flex flex-col gap-4 overflow-y-auto scrollbar-thin"
      role="log"
      aria-live="polite"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm mt-1">Start a conversation by sending a message</p>
        </div>
      ) : (
        messages.map((msg) => {
          let inMessageUserName
          if (msg.user) {
            inMessageUserName = msg.user.name
          } else if (msg.sender) {
            inMessageUserName = msg.sender.name
          } else {
            return null;
          }
          const isUsers = inMessageUserName === username

          return (
            <div key={msg.id} className={`flex ${isUsers ? "justify-end" : "justify-start"}`}>
              <MessageBubble
                messageContent={msg.content}
                messageCreatedAt={msg.createdAt}
                isRead={msg.isRead}
                isUsers={isUsers}
                inMessageUsername={inMessageUserName}
              />
            </div>
          );
        })
      )}
    </div>
  );
};