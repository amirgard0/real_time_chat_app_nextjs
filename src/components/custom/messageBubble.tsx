// src/components/custom/messageBubble.tsx
export const MessageBubble = ({ message, isUsers }: { message: any; isUsers: boolean }) => {
  return (
    <div
      className={`flex flex-col w-full sm:w-[70%] md:w-[50%] transition-all duration-200 hover:bg-opacity-80 ${isUsers ? "items-end" : "items-start"
        }`}
    >
      {!isUsers && (
        <div className="flex items-center gap-2 mb-1">
          {/* <img
            src={message.user.avatar || "/default-avatar.png"}
            alt={`${message.user.name}'s avatar`}
            className="w-6 h-6 rounded-full"
          /> */}
          <small className="text-sm text-muted-foreground">{message.user.name}</small>
        </div>
      )}
      <div
        className={`relative p-3 rounded-xl shadow-sm ${isUsers
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
          : "bg-gray-200 text-gray-800"
          }`}
        role="article"
      >
        <p>{message.content}</p>
        <small className="text-xs opacity-50 mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};