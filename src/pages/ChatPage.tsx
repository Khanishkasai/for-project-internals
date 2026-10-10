import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Badge from "@cloudscape-design/components/badge";
import Spinner from "@cloudscape-design/components/spinner";
import Alert from "@cloudscape-design/components/alert";
import Icon from "@cloudscape-design/components/icon";
import { DESTINATIONS } from "../data/destinations";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  demo?: boolean;
  timestamp: string;
};

const SUGGESTED_PROMPTS = [
  "What are the top 5 things to do in Paris?",
  "Plan a 3-day Tokyo food trip",
  "Best beaches in Bali for beginners",
  "Budget tips for visiting Rome",
  "Where to stay in Barcelona near the beach?",
];

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const destination = searchParams.get("destination") || "";
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm Wanderly AI, your personal travel guide. ${destination ? `I see you're interested in **${destination}** — ask me anything! ` : ""}I can help you discover destinations, plan itineraries, find restaurants, and give you local tips. What would you like to know?`,
      demo: true,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          destination,
        }),
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content,
        demo: data.demo,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        demo: true,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function renderContent(content: string) {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <Box key={i} variant="strong" fontSize="heading-xs" margin={{ top: "s", bottom: "xxs" }}>{line.slice(2, -2)}</Box>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <Box key={i} margin={{ left: "m" }}>- {line.slice(2)}</Box>;
      }
      if (line.trim() === "") return <Box key={i} padding="xxs" />;
      const boldParts = line.split(/(\*\*[^*]+\*\*)/);
      return (
        <Box key={i} fontSize="body-m">
          {boldParts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : <React.Fragment key={j}>{part}</React.Fragment>
          )}
        </Box>
      );
    });
  }

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Ask me anything about travel — destinations, food, planning, and more"
          actions={
            <Button onClick={() => navigate("/itinerary")} iconName="gen-ai" variant="primary">
              Go to Trip Planner
            </Button>
          }
        >
          AI Travel Assistant
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Quick destination chips */}
        <Container>
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Box variant="strong">Quick start:</Box>
            {DESTINATIONS.slice(0, 5).map(d => (
              <Button
                key={d.id}
                variant="normal"
                onClick={() => navigate(`/chat?destination=${encodeURIComponent(d.name)}`)}
              >
                {d.name}
              </Button>
            ))}
          </SpaceBetween>
        </Container>

        {/* Chat container */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                messages.length > 1 && (
                  <Button
                    variant="normal"
                    iconName="refresh"
                    onClick={() => {
                      setMessages([messages[0]]);
                      setError("");
                    }}
                  >
                    Clear Chat
                  </Button>
                )
              }
            >
              Conversation
            </Header>
          }
        >
          <div style={{ minHeight: 400, maxHeight: "calc(100vh - 400px)", overflowY: "auto", padding: "8px" }}>
            <SpaceBetween size="m">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      background: msg.role === "user"
                        ? "var(--color-background-button-primary-default, #006ce0)"
                        : "var(--color-background-container-content, #f5f7f8)",
                      color: msg.role === "user" ? "white" : "inherit",
                      borderRadius: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <SpaceBetween size="xs">
                      <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                        {msg.role === "assistant" && <Icon name="gen-ai" />}
                        <Box fontSize="body-s" color={msg.role === "user" ? "inherit" : "text-body-secondary"}>
                          {msg.role === "user" ? "You" : "Wanderly AI"}
                        </Box>
                        {msg.demo && <Badge color="grey">Demo Mode</Badge>}
                      </SpaceBetween>
                      <div style={{ color: msg.role === "user" ? "white" : undefined }}>
                        {renderContent(msg.content)}
                      </div>
                    </SpaceBetween>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{
                    background: "var(--color-background-container-content, #f5f7f8)",
                    borderRadius: 12, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <Spinner />
                    <Box color="text-body-secondary" fontSize="body-s">Wanderly AI is thinking...</Box>
                  </div>
                </div>
              )}
              {error && <Alert type="error">{error}</Alert>}
              <div ref={messagesEndRef} />
            </SpaceBetween>
          </div>

          {/* Suggested prompts */}
          {messages.length <= 1 && !loading && (
            <Box margin={{ top: "m" }}>
              <Box variant="strong" margin={{ bottom: "s" }}>Try asking:</Box>
              <SpaceBetween direction="horizontal" size="xs">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <Button
                    key={prompt}
                    variant="normal"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </SpaceBetween>
            </Box>
          )}

          {/* Input */}
          <Box margin={{ top: "m" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about destinations, food, planning..."
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border: "1px solid var(--color-border-control-default, #b4b4bb)",
                  padding: "8px 12px",
                  fontFamily: "inherit",
                  fontSize: 14,
                  resize: "none",
                  minHeight: 44,
                  background: "var(--color-background-input-default, #fff)",
                  color: "var(--color-text-body-default, #000)",
                }}
                rows={1}
              />
              <Button
                variant="primary"
                onClick={() => sendMessage(input)}
                loading={loading}
                iconName="send"
              />
            </div>
          </Box>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
