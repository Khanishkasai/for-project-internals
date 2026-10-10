import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Badge from "@cloudscape-design/components/badge";
import Tabs from "@cloudscape-design/components/tabs";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Icon from "@cloudscape-design/components/icon";
import Alert from "@cloudscape-design/components/alert";
import { getDestinationById, getPlacesByCity, DESTINATIONS } from "../data/destinations";
import { PlaceCard } from "../components/PlaceCard";
import { DestinationCard } from "../components/DestinationCard";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dest = getDestinationById(id || "");
  const [isFavorited, setIsFavorited] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!dest) {
    return (
      <ContentLayout header={<Header variant="h1">Destination Not Found</Header>}>
        <Alert type="error" header="Destination not found">
          The destination you're looking for doesn't exist. <Button variant="link" onClick={() => navigate("/explore")}>Back to Explore</Button>
        </Alert>
      </ContentLayout>
    );
  }

  const places = getPlacesByCity(dest.name);
  const attractions = places.filter(p => ["attraction", "museum", "park"].includes(p.type));
  const restaurants = places.filter(p => ["restaurant", "cafe"].includes(p.type));
  const hotels = places.filter(p => p.type === "hotel");
  const similar = DESTINATIONS.filter(d => d.id !== dest.id && (d.region === dest.region || d.tags.some(t => dest.tags.includes(t)))).slice(0, 3);
  const destination = dest;

  async function toggleFavorite() {
    if (!user) { alert("Sign in to save favorites"); return; }
    if (isFavorited) {
      await supabase.from("favorites").delete().eq("place_id", destination.id).eq("user_id", user.id);
      setIsFavorited(false);
    } else {
      await supabase.from("favorites").insert({
        place_id: destination.id,
        place_name: destination.name,
        place_type: "destination",
        place_data: destination as unknown as Record<string, unknown>,
      });
      setIsFavorited(true);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={`${destination.country} · ${destination.region}`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName={isFavorited ? "heart-filled" : "heart"}
                onClick={toggleFavorite}
              >
                {isFavorited ? "Saved" : "Save"}
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/itinerary?destination=${encodeURIComponent(destination.name)}`)}
                iconName="gen-ai"
              >
                Plan a Trip
              </Button>
            </SpaceBetween>
          }
        >
          {destination.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        {saveSuccess && (
          <Alert type="success" dismissible onDismiss={() => setSaveSuccess(false)}>
            {destination.name} saved to your favorites!
          </Alert>
        )}

        {/* Hero image */}
        <div style={{ borderRadius: 12, overflow: "hidden", height: 360, position: "relative" }}>
          <img
            src={destination.image}
            alt={destination.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
              padding: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <SpaceBetween direction="horizontal" size="xs">
              {destination.tags.map(tag => (
                <Badge key={tag} color="blue">{tag}</Badge>
              ))}
            </SpaceBetween>
            <StatusIndicator type="success">
              <span style={{ color: "white" }}>{destination.rating} · {(destination.reviewCount / 1000).toFixed(0)}k reviews</span>
            </StatusIndicator>
          </div>
        </div>

        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 8 } },
            { colspan: { default: 12, s: 4 } },
          ]}
        >
          {/* Left: content */}
          <SpaceBetween size="l">
            <Container header={<Header variant="h2">About {destination.name}</Header>}>
              <SpaceBetween size="m">
                <Box fontSize="body-m">{destination.longDescription}</Box>
                <Header variant="h3">Highlights</Header>
                <ColumnLayout columns={2} borders="none">
                  {destination.highlights.map(h => (
                    <Box key={h}>
                      <Icon name="check" /> {h}
                    </Box>
                  ))}
                </ColumnLayout>
              </SpaceBetween>
            </Container>

            <Container header={<Header variant="h2">Places to Explore</Header>}>
              <Tabs
                tabs={[
                  {
                    id: "attractions",
                    label: `Attractions (${attractions.length})`,
                    content: attractions.length > 0 ? (
                      <Grid gridDefinition={attractions.map(() => ({ colspan: { default: 12, xs: 6 } }))}>
                        {attractions.map(p => <PlaceCard key={p.id} place={p} />)}
                      </Grid>
                    ) : (
                      <Box padding="m" textAlign="center" color="text-body-secondary">
                        No attractions listed — check back soon
                      </Box>
                    ),
                  },
                  {
                    id: "food",
                    label: `Restaurants (${restaurants.length})`,
                    content: restaurants.length > 0 ? (
                      <Grid gridDefinition={restaurants.map(() => ({ colspan: { default: 12, xs: 6 } }))}>
                        {restaurants.map(p => <PlaceCard key={p.id} place={p} />)}
                      </Grid>
                    ) : (
                      <Box padding="m" textAlign="center" color="text-body-secondary">
                        No restaurants listed yet
                      </Box>
                    ),
                  },
                  {
                    id: "hotels",
                    label: `Hotels (${hotels.length})`,
                    content: hotels.length > 0 ? (
                      <Grid gridDefinition={hotels.map(() => ({ colspan: { default: 12, xs: 6 } }))}>
                        {hotels.map(p => <PlaceCard key={p.id} place={p} />)}
                      </Grid>
                    ) : (
                      <Box padding="m" textAlign="center" color="text-body-secondary">
                        No hotels listed yet
                      </Box>
                    ),
                  },
                ]}
              />
            </Container>
          </SpaceBetween>

          {/* Right: info panel */}
          <SpaceBetween size="l">
            <Container header={<Header variant="h3">Quick Facts</Header>}>
              <KeyValuePairs
                columns={1}
                items={[
                  { label: "Best Time to Visit", value: destination.bestTime },
                  { label: "Avg Daily Budget", value: destination.budget },
                  { label: "Currency", value: destination.currency },
                  { label: "Language", value: destination.language },
                  { label: "Timezone", value: destination.timezone },
                ]}
              />
            </Container>

            <Container header={<Header variant="h3">Weather Guide</Header>}>
              <SpaceBetween size="s">
                {destination.weather.map(w => (
                  <Box key={w.month}>
                    <SpaceBetween direction="horizontal" size="m" alignItems="center">
                      <Box variant="strong">{w.month}</Box>
                      <Box>{w.temp}</Box>
                      <Box fontSize="body-s" color="text-body-secondary">{w.condition}</Box>
                    </SpaceBetween>
                  </Box>
                ))}
              </SpaceBetween>
            </Container>

            <Container>
              <SpaceBetween size="m">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate(`/itinerary?destination=${encodeURIComponent(destination.name)}`)}
                  iconName="gen-ai"
                >
                  Generate Itinerary
                </Button>
                <Button
                  fullWidth
                  onClick={() => navigate(`/map?city=${encodeURIComponent(destination.name)}&lat=${destination.lat}&lng=${destination.lng}`)}
                  iconName="map"
                >
                  Explore on Map
                </Button>
                <Button
                  fullWidth
                  onClick={() => navigate(`/chat?destination=${encodeURIComponent(destination.name)}`)}
                  iconName="suggestions-gen-ai"
                >
                  Ask AI About This
                </Button>
              </SpaceBetween>
            </Container>
          </SpaceBetween>
        </Grid>

        {similar.length > 0 && (
          <Container header={<Header variant="h2">Similar Destinations</Header>}>
            <Grid
              gridDefinition={similar.map(() => ({ colspan: { default: 12, xs: 6, s: 4 } }))}
            >
              {similar.map(dest => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  onNavigate={id => navigate(`/destination/${id}`)}
                />
              ))}
            </Grid>
          </Container>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
