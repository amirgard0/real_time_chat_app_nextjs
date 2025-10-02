// src/components/custom/chatBox.tsx
import { useEffect, useRef } from "react";
import { MessageBubble } from "./messageBubble";

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
      className="bg-muted p-3 sm:p-4 rounded-lg flex flex-col gap-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto"
      role="log"
      aria-live="polite"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No messages yet</p>
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
              <MessageBubble messageContent={msg.content} messageCreatedAt={msg.createdAt} isRead={msg.isRead} isUsers={isUsers} inMessageUsername={inMessageUserName} />
            </div>
          );
        })
      )}
    </div>
  );
};