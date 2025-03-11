import { type ReactNode, createContext, useContext } from "react";
import { type StreamOptions, useStream } from "./useStream";

// Define the context type based on the hook's return type.
type StreamContextType = ReturnType<typeof useStream>;

// Create the context with an initial undefined value.
const StreamContext = createContext<StreamContextType | undefined>(undefined);

type StreamProviderProps = {
  children: ReactNode;
  sessionId: string;
  options?: StreamOptions;
};

export const StreamProvider = ({
  children,
  sessionId,
  options,
}: StreamProviderProps) => {
  const stream = useStream(sessionId, options);

  return (
    <StreamContext.Provider value={stream}>{children}</StreamContext.Provider>
  );
};

// Custom hook for easy access to the stream context.
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export const useStreamSource = (
  sessionId: string,
  options: StreamOptions = {},
) => {
  const context = useContext(StreamContext);
  // If the context is available, return it; otherwise, call useStream directly.
  return context ?? useStream(sessionId, options);
};
