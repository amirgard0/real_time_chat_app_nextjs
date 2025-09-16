// src/components/custom/chatBox.tsx
import { useEffect, useRef } from "react";
import { MessageBubble } from "./messageBubble";

export const ChatBox = ({ messages, username }: { messages: any[]; username: string }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={chatRef}
      className="bg-muted p-4 rounded-xl flex flex-col gap-2 max-h-[400px] overflow-y-auto"
      role="log"
      aria-live="polite"
    >
      {messages.map((msg) => {
        let inMessageUserName
        if (msg.user) {
          inMessageUserName = msg.user.name
        } else if (msg.sender) {
          inMessageUserName = msg.sender.name
        } else {
          return
        }
        const isUsers = inMessageUserName === username
        return (
          <div key={msg.id} className={`flex ${isUsers ? "justify-end" : "justify-start"}`}>
            <MessageBubble message={msg} isUsers={isUsers} inMessageUsername={inMessageUserName} />
          </div>
        );
      })}
    </div>
  );
};