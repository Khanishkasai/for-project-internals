import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import Badge from "@cloudscape-design/components/badge";
import Icon from "@cloudscape-design/components/icon";
import { DESTINATIONS } from "../data/destinations";
import { DestinationCard } from "../components/DestinationCard";

const HERO_STATS = [
  { label: "Destinations", value: "190+" },
  { label: "Happy Travelers", value: "2M+" },
  { label: "AI Itineraries", value: "500K+" },
  { label: "Reviews", value: "10M+" },
];

const QUICK_CATEGORIES = [
  { icon: "globe", label: "Beach", filter: "beach" },
  { icon: "star-filled", label: "Culture", filter: "culture" },
  { icon: "heart-filled", label: "Romance", filter: "romance" },
  { icon: "flag", label: "Adventure", filter: "adventure" },
  { icon: "search", label: "Food", filter: "food" },
  { icon: "location-pin", label: "Luxury", filter: "luxury" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const featured = DESTINATIONS.slice(0, 6);

  function handleSearch() {
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  }

  return (
    <ContentLayout
      header={
        <div
          style={{
            background: "linear-gradient(135deg, #1d1d1f 0%, #343438 62%, #667085 145%)",
            borderRadius: 28,
            padding: "64px 40px",
            marginBottom: 8,
          }}
        >
          <SpaceBetween size="l" alignItems="center">
            <Box textAlign="center">
              <Box variant="h1" fontSize="display-l" color="inherit">
                <span style={{ color: "white", fontWeight: 800 }}>
                  Discover Your Next Adventure
                </span>
              </Box>
              <Box fontSize="heading-m" color="inherit">
                <span style={{ color: "rgba(255,255,255,0.85)" }}>
                  AI-powered travel planning for the modern explorer
                </span>
              </Box>
            </Box>

            <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 600 }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Search destinations, cities, landmarks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.detail.value)}
                  onKeyDown={e => e.detail.key === "Enter" && handleSearch()}
                  type="search"
                />
              </div>
              <Button variant="primary" onClick={handleSearch} iconName="search">
                Search
              </Button>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              {QUICK_CATEGORIES.map(cat => (
                <button
                  key={cat.filter}
                  onClick={() => navigate(`/explore?tag=${cat.filter}`)}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.38)",
                    borderRadius: 999,
                    padding: "8px 16px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                >
                  <Icon name={cat.icon as "globe"} />
                  {cat.label}
                </button>
              ))}
            </div>
          </SpaceBetween>
        </div>
      }
    >
      <SpaceBetween size="xl">
        {/* Stats banner */}
        <Container>
          <Grid
            gridDefinition={[
              { colspan: { default: 6, s: 3 } },
              { colspan: { default: 6, s: 3 } },
              { colspan: { default: 6, s: 3 } },
              { colspan: { default: 6, s: 3 } },
            ]}
          >
            {HERO_STATS.map(stat => (
              <Box key={stat.label} textAlign="center" padding="m">
                <Box variant="h1" fontSize="heading-xl" color="text-status-info">
                  {stat.value}
                </Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  {stat.label}
                </Box>
              </Box>
            ))}
          </Grid>
        </Container>

        {/* Featured destinations */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                <Button onClick={() => navigate("/explore")} iconAlign="right" iconName="angle-right">
                  View all destinations
                </Button>
              }
            >
              Featured Destinations
            </Header>
          }
        >
          <Grid
            gridDefinition={[
              { colspan: { default: 12, xs: 6, s: 4 } },
              { colspan: { default: 12, xs: 6, s: 4 } },
              { colspan: { default: 12, xs: 6, s: 4 } },
              { colspan: { default: 12, xs: 6, s: 4 } },
              { colspan: { default: 12, xs: 6, s: 4 } },
              { colspan: { default: 12, xs: 6, s: 4 } },
            ]}
          >
            {featured.map(dest => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onNavigate={id => navigate(`/destination/${id}`)}
              />
            ))}
          </Grid>
        </Container>

        {/* Feature highlights */}
        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 4 } },
            { colspan: { default: 12, s: 4 } },
            { colspan: { default: 12, s: 4 } },
          ]}
        >
          {[
            {
              title: "AI Trip Planner",
              desc: "Get a personalized day-by-day itinerary generated by AI, tailored to your interests, budget, and travel style.",
              icon: "gen-ai",
              action: () => navigate("/itinerary"),
              label: "Plan a Trip",
              gradient: "linear-gradient(135deg, #1d1d1f, #45454b)",
            },
            {
              title: "Interactive Map",
              desc: "Explore destinations visually. Discover attractions, restaurants, and hotels on an interactive map with real places.",
              icon: "map",
              action: () => navigate("/map"),
              label: "Open Map",
              gradient: "linear-gradient(135deg, #3b4b63, #77869d)",
            },
            {
              title: "AI Travel Assistant",
              desc: "Chat with Wanderly AI to get personalized recommendations, local tips, and answers to all your travel questions.",
              icon: "suggestions-gen-ai",
              action: () => navigate("/chat"),
              label: "Ask AI",
              gradient: "linear-gradient(135deg, #596273, #aeb5c0)",
            },
          ].map(feature => (
            <Container key={feature.title}>
              <SpaceBetween size="m">
                <div
                  style={{
                    background: feature.gradient,
                    borderRadius: 20,
                    padding: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "white" }}>
                    <Icon name={feature.icon as "gen-ai"} size="big" />
                  </span>
                </div>
                <Header variant="h3">{feature.title}</Header>
                <Box fontSize="body-s" color="text-body-secondary">
                  {feature.desc}
                </Box>
                <Button variant="primary" onClick={feature.action} fullWidth>
                  {feature.label}
                </Button>
              </SpaceBetween>
            </Container>
          ))}
        </Grid>

        {/* Why Wanderly */}
        <Container
          header={<Header variant="h2">Why Travelers Love Wanderly</Header>}
        >
          <Grid
            gridDefinition={[
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
            ]}
          >
            {[
              { icon: "star-filled", title: "Smart Recommendations", desc: "AI learns your preferences" },
              { icon: "location-pin", title: "Real Places Data", desc: "Verified restaurants & stays" },
              { icon: "download", title: "Export Itineraries", desc: "PDF, share, and offline access" },
              { icon: "heart-filled", title: "Save Everything", desc: "Build your dream trip list" },
            ].map(item => (
              <Box key={item.title} textAlign="center" padding="m">
                <SpaceBetween size="s" alignItems="center">
                  <Icon name={item.icon as "star-filled"} size="big" />
                  <Box variant="strong">{item.title}</Box>
                  <Box fontSize="body-s" color="text-body-secondary">{item.desc}</Box>
                </SpaceBetween>
              </Box>
            ))}
          </Grid>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
