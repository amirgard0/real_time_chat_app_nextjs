import { auth } from "@/lib/auth"
import { MessageBubble } from "./messageBubble"

export const ChatBox = ({ messages, username }: { messages: any[], username: string }) => {
  return <div className="bg-muted p-2 rounded-xl flex flex-col">
    {messages.map((msg) => {
      const isUsers = msg.user.name == username
      return <div key={msg.id} className={`flex ${isUsers && "justify-end"}`}>
        <MessageBubble message={msg} isUsers={isUsers} />
      </div>
    })}
  </div>
}