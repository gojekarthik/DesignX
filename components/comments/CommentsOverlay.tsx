"use client";

import { useCallback, useRef } from "react";
import { useThreads, useEditThreadMetadata, useUser } from "@liveblocks/react"; // Updated imports
import { useMaxZIndex } from "@/lib/useMaxZIndex";
import { PinnedThread } from "./PinnedThread";
import { ThreadData } from "@liveblocks/client";

type OverlayThreadProps = {
  thread: ThreadData<Liveblocks["ThreadMetadata"]>;
  maxZIndex: number;
};

export const CommentsOverlay = () => {
  /**
   * We're using the useThreads hook to get the list of threads
   * in the room.
   */
  const { threads } = useThreads(); // Ensure threads might be undefined

  // Get the max z-index of a thread
  const maxZIndex = useMaxZIndex();

  // Ensure threads is defined before trying to filter or map
  return (
    <div>
      {threads && threads.length > 0 ? (
        threads
          .filter((thread) => !thread.metadata.resolved)
          .map((thread) => (
            <OverlayThread key={thread.id} thread={thread} maxZIndex={maxZIndex} />
          ))
      ) : (
        <p>No active threads available.</p>
      )}
    </div>
  );
};

const OverlayThread = ({ thread, maxZIndex }: OverlayThreadProps) => {
  const editThreadMetadata = useEditThreadMetadata();

  const { isLoading } = useUser(thread.comments[0].userId);

  const threadRef = useRef<HTMLDivElement>(null);

  const handleIncreaseZIndex = useCallback(() => {
    if (maxZIndex === thread.metadata.zIndex) {
      return;
    }

    // Update the z-index of the thread in the room
    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    });
  }, [thread, editThreadMetadata, maxZIndex]);

  if (isLoading) {
    return null;
  }

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className="absolute left-0 top-0 flex gap-5"
      style={{
        transform: `translate(${thread.metadata.x}px, ${thread.metadata.y}px)`,
      }}
    >
      {/* render the thread */}
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  );
};
