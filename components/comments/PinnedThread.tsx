"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ThreadData } from "@liveblocks/client";
import { Thread } from "@liveblocks/react-ui";

type Props = {
  thread: ThreadData<Liveblocks["ThreadMetadata"]>;
  onFocus: (threadId: string) => void;
  onResolve: (threadId: string) => void; // Function to mark thread as resolved
  updateThreadMetadata?: (threadId: string, newMetadata: any) => void; // Optional function to update other metadata
};

export const PinnedThread = ({ thread, onFocus, onResolve,updateThreadMetadata, ...props }: Props) => {
  // Open pinned threads that have just been created
  const startMinimized = useMemo(
    () => Number(new Date()) - Number(new Date(thread.createdAt)) > 100,
    [thread]
  );

  const [minimized, setMinimized] = useState(startMinimized);

  const handleMarkResolved = () => {
    onResolve(thread.id);
    if (updateThreadMetadata) {
      updateThreadMetadata(thread.id, { resolved: true }); // Update "resolved" flag in metadata
    }
  };

  /**
   * memoize the result of this function so that it doesn't change on every render but only when the thread changes
   * Memo is used to optimize performance and avoid unnecessary re-renders.
   *
   * useMemo: https://react.dev/reference/react/useMemo
   */

  const memoizedContent = useMemo(
    () => (
      <div
        className='absolute flex cursor-pointer gap-4'
        {...props}
        onClick={(e: any) => {
          onFocus(thread.id);

          // Check if the click is on the lb-icon or lb-button-icon to mark the thread as resolved
          if (
            e.target &&
            (e.target.classList.contains("lb-icon") || e.target.classList.contains("lb-button-icon"))
          ) {
            handleMarkResolved();
            return; // Early return so the rest of the logic is skipped
          }

          setMinimized(!minimized);
        }}
      >
        {!thread.resolved && (
          <div
            className="relative flex h-9 w-9 select-none items-center justify-center rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full bg-white shadow"
            data-draggable={true}
          >
            <Image
              src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
              alt="Dummy Name"
              width={28}
              height={28}
              draggable={false}
              className="rounded-full"
            />
          </div>
        )}
        {!minimized ? (
          <div className="flex min-w-60 flex-col overflow-hidden rounded-lg bg-white text-sm shadow">
            <Thread
              thread={thread}
              indentCommentContent={false}
              onKeyUp={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
        ) : null}
      </div>
    ),
    [thread.comments.length, minimized, thread.resolved]
  );

  return <>{memoizedContent}</>;
};
