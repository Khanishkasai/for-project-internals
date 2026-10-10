import React from "react";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Badge from "@cloudscape-design/components/badge";
import Icon from "@cloudscape-design/components/icon";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import type { Destination } from "../data/destinations";

type Props = {
  destination: Destination;
  onNavigate?: (id: string) => void;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
};

export function DestinationCard({ destination, onNavigate, onFavorite, isFavorited }: Props) {
  return (
    <div
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(29,29,31,0.08)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 28px rgba(29,29,31,0.14)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 18px rgba(29,29,31,0.08)";
      }}
    >
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img
          src={destination.image}
          alt={destination.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => {
            (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg";
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            padding: "16px",
          }}
        >
          <Box color="inherit" variant="h3" fontSize="heading-m">
            <span style={{ color: "white" }}>{destination.name}</span>
          </Box>
          <Box color="inherit" fontSize="body-s">
            <span style={{ color: "rgba(255,255,255,0.85)" }}>
              {destination.country} · {destination.region}
            </span>
          </Box>
        </div>
        {onFavorite && (
          <button
            onClick={e => { e.stopPropagation(); onFavorite(destination.id); }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={isFavorited ? "heart-filled" : "heart"} />
          </button>
        )}
      </div>
      <Container>
        <SpaceBetween size="s">
          <Box fontSize="body-s" color="text-body-secondary">
            {destination.description}
          </Box>
          <SpaceBetween direction="horizontal" size="xs">
            {destination.tags.slice(0, 3).map(tag => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </SpaceBetween>
          <SpaceBetween direction="horizontal" size="m">
            <StatusIndicator type="success">
              {destination.rating} ({(destination.reviewCount / 1000).toFixed(0)}k reviews)
            </StatusIndicator>
            <Box fontSize="body-s" color="text-body-secondary">
              {destination.budget}
            </Box>
          </SpaceBetween>
          {onNavigate && (
            <Button
              variant="primary"
              onClick={() => onNavigate(destination.id)}
              fullWidth
            >
              Explore {destination.name}
            </Button>
          )}
        </SpaceBetween>
      </Container>
    </div>
  );
}
