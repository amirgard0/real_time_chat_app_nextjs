// src/components/custom/messageBubble.tsx
export const MessageBubble = ({ message, isUsers, inMessageUsername }: { message: any; isUsers: boolean, inMessageUsername: string }) => {
  return (
    <div
      className={`flex flex-col w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] transition-all duration-200 hover:opacity-90 ${isUsers ? "items-end" : "items-start"
        }`}
    >
      {!isUsers && (
        <div className="flex items-center gap-2 mb-1">
          <small className="text-xs text-muted-foreground">{inMessageUsername}</small>
        </div>
      )}
      <div
        className={`relative p-3 rounded-xl shadow-sm ${isUsers
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
          }`}
        role="article"
      >
        <p className="text-sm sm:text-base break-words">{message.content}</p>
        <small className="text-xs opacity-70 mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </small>
      </div>
    </div>
  );
};