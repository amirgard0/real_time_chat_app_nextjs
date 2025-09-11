import { Button } from "../ui/button"
import { Card } from "../ui/card"

export const MessageBubble = ({ message, isUsers }: { message: any, isUsers: boolean }) => {
  return (
    <div className="flex flex-col justify-end w-[45%]">
      {
        !isUsers &&
        <small className="opacity-35">{message.user.name}</small>
      }
      <div className={`relative flex ${isUsers && "justify-end"}`}>
        <div className={`${isUsers ? "bg-blue-600" : "bg-primary"} text-primary-foreground w-max p-1 px-3 my-1 rounded-xl right-0`}>
          {message.content}
        </div>
      </div>
    </div>
  )
}