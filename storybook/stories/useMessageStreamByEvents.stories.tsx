import { useMessageStreamByEvents, useStream } from "@flux0-ai/react";
import { handlers } from "@flux0-ai/react/test-utils";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const StreamDemo = ({
  sessionId,
  serverTemplateUrl,
}: { sessionId: string; serverTemplateUrl: string }) => {
  const [correlationId, setCorrelationId] = useState<string>(() =>
    Math.random().toString(36).substr(2, 9),
  );
  const { events, streaming, error, startStreaming, stopStreaming } = useStream(
    { serverTemplateUrl },
  );

  const { messages, isThinking, resetMessages } = useMessageStreamByEvents({
    correlationId,
    sessionStream: events,
  });
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
      <p>
        A more low level hook that submits user input and streams events for a
        session.
      </p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setInput("");
            setCorrelationId(Math.random().toString(36).substr(2, 9));
            startStreaming(sessionId, input);
          }
        }}
        placeholder="Enter message..."
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <button
        type="button"
        onClick={() => {
          setCorrelationId(Math.random().toString(36).substr(2, 9));
          startStreaming(sessionId, input);
        }}
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
        <h4>
          Received Messages {messages.length}, Events {events.length}
        </h4>

        {messages.length === 0 ? (
          <p>No messages yet...</p>
        ) : (
          messages.map((event, idx) => (
            <pre
              // biome-ignore lint/suspicious/noArrayIndexKey: TODO remove this once chunk event will have an id
              key={idx}
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
  title: "Hooks/useMessageStreamByEvens",
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
