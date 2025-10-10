import { cn } from "@/lib/utils";
import { CheckCheckIcon, CheckIcon } from "lucide-react";

// src/components/custom/messageBubble.tsx
export const MessageBubble = (
  { messageContent, messageCreatedAt, isUsers, inMessageUsername, isRead }:
    { messageContent: string; messageCreatedAt: any; isUsers: boolean, inMessageUsername: string, isRead?: boolean }) => {
  return (
    <div className={cn(
      "flex flex-col w-full max-w-[85%] transition-all duration-300",
      isUsers ? "items-end" : "items-start"
    )}>
      {!isUsers && (
        <div className="flex items-center gap-2 mb-1 px-2">
          <span className="text-sm font-medium text-muted-foreground">
            {inMessageUsername}
          </span>
        </div>
      )}
      <div
        className={cn(
          "relative p-4 rounded-lg shadow-sm border",
          isUsers
            ? "bg-primary/90 text-primary-foreground border-primary/30"
            : "bg-card text-foreground border-border/50",
          "hover:shadow-md transition-shadow duration-200"
        )}
        role="article"
      >
        <p className="text-base leading-relaxed">
          {messageContent}
        </p>
        <div className="flex items-center gap-2 mt-2 justify-end">
          <small className={cn(
            "text-xs font-light",
            isUsers ? "text-primary-foreground/80" : "text-muted-foreground/80"
          )}>
            {new Date(messageCreatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>
          {isUsers && (
            <span
              className={cn(
                "flex items-center",
                "text-accent-foreground"
              )}
            >
              {
                isRead ? <CheckCheckIcon size={14} strokeWidth={2} className="text-green-700" /> : <CheckIcon size={14} strokeWidth={2} />
              }
            </span>
          )}
        </div>
        <div
          className={cn(
            "absolute w-3 h-3 bg-inherit transform rotate-45 -bottom-1.5 border-b border-r",
            isUsers
              ? "right-4 border-primary/30"
              : "left-4 border-border/50"
          )}
        />
      </div>
    </div>);
};