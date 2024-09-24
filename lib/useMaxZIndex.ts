import { useMemo } from "react";
import { useThreads } from "@liveblocks/react"; // Updated import

// Define the type for thread metadata
type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  x: number;
  y: number;
  // Add other properties as needed
};

// Returns the highest z-index of all threads
export const useMaxZIndex = () => {
  // get all threads
  const { threads } = useThreads(); // Specify the metadata type

  // calculate the max z-index
  return useMemo(() => {
    let max = 0;
    if (threads) {
      for (const thread of threads) {
        // Ensure thread.metadata is defined and has the expected shape
        if (thread.metadata && thread.metadata.zIndex > max) {
          max = thread.metadata.zIndex;
        }
      }
    }
    return max;
  }, [threads]);
};
