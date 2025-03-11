import { type Event, type Message, useMessageStream } from "@flux0-ai/react";
import { handlers } from "@flux0-ai/react/test-utils";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const StreamDemo = ({
  sessionId,
  serverTemplateUrl,
}: { sessionId: string; serverTemplateUrl: string }) => {
  const [loadedEvents, setLoadedEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [input, setInput] = useState("");

  const handlePreloadEvents = () => {
    setLoadingEvents(true);
    fetch(`/api/sessions/${sessionId}/events`)
      .then((res) => res.json())
      .then((data) => {
        setLoadedEvents(data.data);
        setLoadingEvents(false);
      })
      .catch((error) => {
        console.error("Failed to fetch initial events:", error);
        setLoadingEvents(false);
      });
  };

  const {
    messages,
    streaming,
    error,
    startStreaming,
    stopStreaming,
    emittedEvents,
  } = useMessageStream(sessionId, { serverTemplateUrl, events: loadedEvents });

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>Stream Messages Demo</h3>
      <p>A unified hook to handle both loaded events and event emissions</p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter message..."
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <button
        type="button"
        onClick={handlePreloadEvents}
        disabled={loadingEvents}
        style={{ marginRight: "8px" }}
      >
        {loadingEvents ? "Loading Events..." : "Preload Events"}
      </button>
      <button
        type="button"
        onClick={() => startStreaming(input)}
        disabled={streaming}
        style={{ marginRight: "8px" }}
      >
        Start Streaming
      </button>
      <button type="button" onClick={stopStreaming} disabled={!streaming}>
        Stop Streaming
      </button>
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      <h4>
        <span>Streaming: {streaming ? "Yes" : "No"},</span>
        <span style={{ marginLeft: "8px" }}>
          Loaded Events: {loadedEvents.length},
        </span>
        <span style={{ marginLeft: "8px" }}>
          Emitted Events: {emittedEvents.length}
        </span>
      </h4>

      <div
        style={{
          marginTop: "15px",
          maxHeight: "250px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
        }}
      >
        <h4>Messages {messages.length}</h4>
        {messages.length === 0 ? (
          <p>No messages yet...</p>
        ) : (
          messages.map((msg: Message) => (
            <pre
              key={msg.id}
              style={{
                background: "#f5f5f5",
                padding: "5px",
                borderRadius: "5px",
              }}
            >
              {JSON.stringify(msg, null, 2)}
            </pre>
          ))
        )}
      </div>
    </div>
  );
};

const meta = {
  title: "Hooks/useMessageStream",
  component: StreamDemo,
  argTypes: {
    sessionId: { control: { type: "text" }, defaultValue: "sess123" },
    serverUrl: {
      control: { type: "text" },
      defaultValue: "/api/sessions/{sessionId}/events/stream",
    },
  },
} as Meta<typeof StreamDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers,
    },
  },
  args: {
    sessionId: "sess123",
    serverTemplateUrl: "/api/sessions/{sessionId}/events/stream",
  },
};
