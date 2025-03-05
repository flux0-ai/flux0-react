import type { Event, Message } from "@flux0-ai/react";
import { useInitialEvents } from "@flux0-ai/react";
import { handlers } from "@flux0-ai/react/test-utils";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const StreamDemo = ({
  sessionId,
  serverUrl,
}: { sessionId: string; serverUrl: string }) => {
  const [initialEvents, setInitialEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const handlePreloadEvents = () => {
    setLoadingEvents(true);
    fetch(serverUrl.replace("{sessionId}", sessionId))
      .then((res) => res.json())
      .then((data) => {
        setInitialEvents(data.data);
        setLoadingEvents(false);
      })
      .catch((error) => {
        console.error("Failed to fetch initial events:", error);
        setLoadingEvents(false);
      });
  };

  const { messages } = useInitialEvents({ events: initialEvents });

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>Handle pre loaded events</h3>
      <p>
        This hook is responsible for loading previous events stored for the
        session and transform them to Messages. Click{" "}
        <span style={{ fontWeight: "bolder" }}>Load Session Events</span> to
        load the events.
      </p>
      <button
        type="button"
        onClick={handlePreloadEvents}
        disabled={loadingEvents}
        style={{ marginLeft: "8px" }}
      >
        {loadingEvents ? "Loading Events..." : "Load session events"}
      </button>

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
        <span style={{ fontSize: 14 }}>
          Processed events {initialEvents.length}
        </span>
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
  title: "Hooks/useInitialEvents",
  component: StreamDemo,
  argTypes: {
    sessionId: { control: { type: "text" }, defaultValue: "sess123" },
    serverUrl: {
      control: { type: "text" },
      defaultValue: "/api/sessions/{sessionId}/events",
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
    serverUrl: "/api/sessions/{sessionId}/events",
  },
};
