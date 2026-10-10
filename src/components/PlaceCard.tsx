import React from "react";
import Container from "@cloudscape-design/components/container";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Badge from "@cloudscape-design/components/badge";
import Icon from "@cloudscape-design/components/icon";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import type { Place } from "../data/destinations";

const PRICE_LABELS = ["", "$", "$$", "$$$", "$$$$"];

type Props = {
  place: Place;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  onSelect?: (place: Place) => void;
  compact?: boolean;
};

export function PlaceCard({ place, onFavorite, isFavorited, onSelect, compact }: Props) {
  return (
    <div
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: onSelect ? "pointer" : "default",
      }}
      onClick={() => onSelect?.(place)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
      }}
    >
      {!compact && (
        <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
          <img
            src={place.image}
            alt={place.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => {
              (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg";
            }}
          />
          {onFavorite && (
            <button
              onClick={e => { e.stopPropagation(); onFavorite(place.id); }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={isFavorited ? "heart-filled" : "heart"} />
            </button>
          )}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "rgba(0,0,0,0.6)",
              color: "white",
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 11,
            }}
          >
            {place.category}
          </div>
        </div>
      )}
      <Container>
        <SpaceBetween size="xs">
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Box variant="h4" fontSize="heading-s">{place.name}</Box>
            <Badge color={
              place.type === "restaurant" || place.type === "cafe" ? "green" :
              place.type === "hotel" ? "blue" : "grey"
            }>
              {PRICE_LABELS[place.priceLevel]}
            </Badge>
          </SpaceBetween>
          <StatusIndicator type="success">
            {place.rating} · {place.reviewCount.toLocaleString()} reviews
          </StatusIndicator>
          {!compact && (
            <Box fontSize="body-s" color="text-body-secondary">
              {place.description}
            </Box>
          )}
          <SpaceBetween direction="horizontal" size="xs">
            <Box fontSize="body-s" color="text-body-secondary">
              <Icon name="location-pin" /> {place.city}
            </Box>
            {place.openHours && (
              <Box fontSize="body-s" color="text-body-secondary">
                {place.openHours}
              </Box>
            )}
          </SpaceBetween>
          {!compact && place.tags && (
            <SpaceBetween direction="horizontal" size="xxs">
              {place.tags.slice(0, 3).map(tag => (
                <Badge key={tag} color="grey">{tag}</Badge>
              ))}
            </SpaceBetween>
          )}
          {onSelect && !compact && (
            <Button variant="normal" onClick={() => onSelect(place)} fullWidth>
              View Details
            </Button>
          )}
        </SpaceBetween>
      </Container>
    </div>
  );
}
