import React, { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import StoryMessage from "./StoryMessage";
import ChangesSummary from "./ChangesSummary";

export default function VirtualizedMessages({ messages, changesHistory, character, chronicle }) {
  const parentRef = useRef(null);
  const scrollToBottomRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  useEffect(() => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          const changesForMessage = changesHistory.find(c => c.messageIndex === virtualItem.index + 1);

          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
            >
              <div className="space-y-4 mb-4">
                <StoryMessage
                  message={message}
                  npcName={null}
                  character={character}
                  chronicle={chronicle}
                />
                {changesForMessage && message.role === 'assistant' && (
                  <ChangesSummary changes={changesForMessage} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={scrollToBottomRef} />
    </div>
  );
}