import { type ReactNode, createContext, useContext } from "react";
import { type StreamOptions, useStream } from "./useStream";

type StreamResult = ReturnType<typeof useStream>;

// Define the context type
type StreamContextType = {
  stream: StreamResult;
};

// Create context
const StreamContext = createContext<StreamContextType | undefined>(undefined);

type StreamProviderProps = {
  children: ReactNode;
  options?: StreamOptions;
};

// Create provider
export const StreamProvider = ({ children, options }: StreamProviderProps) => {
  const stream = useStream(options);

  return (
    <StreamContext.Provider value={{ stream }}>
      {children}
    </StreamContext.Provider>
  );
};

// Create a custom hook to access the stream
export const useStreamContext = (options?: StreamOptions): StreamResult => {
  const context = useContext(StreamContext);

  // If inside a provider and a session exists, return the provider's stream
  if (context) {
    return context.stream;
  }

  return useStream(options);
};
