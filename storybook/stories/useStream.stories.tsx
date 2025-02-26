import { useStream } from "@flux0-ai/react";
import { handlers } from "@flux0-ai/react/test-utils";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const StreamDemo = ({
  sessionId,
  serverUrl,
}: { sessionId: string; serverUrl: string }) => {
  const { events, streaming, error, startStreaming, stopStreaming } = useStream(
    { serverUrl },
  );
  const [input, setInput] = useState("");

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>Stream Demo</h3>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter message..."
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <button
        type="button"
        onClick={() => startStreaming(sessionId, input)}
        disabled={streaming}
        style={{ marginRight: "8px" }}
      >
        Start Streaming
      </button>
      <button type="button" onClick={stopStreaming} disabled={!streaming}>
        Stop Streaming
      </button>

      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      <h4>Streaming: {streaming ? "Yes" : "No"}</h4>

      <div
        style={{
          marginTop: "15px",
          maxHeight: "250px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
        }}
      >
        <h4>Received Events {events.length}</h4>
        {events.length === 0 ? (
          <p>No events yet...</p>
        ) : (
          events.map((event) => (
            <pre
              key={event.id}
              style={{
                background: "#f5f5f5",
                padding: "5px",
                borderRadius: "5px",
              }}
            >
              {JSON.stringify(event, null, 2)}
            </pre>
          ))
        )}
      </div>
    </div>
  );
};

const meta = {
  title: "Hooks/useStream",
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
    serverUrl: "/api/sessions/{sessionId}/events/stream",
  },
};
