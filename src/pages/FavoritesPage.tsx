import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Badge from "@cloudscape-design/components/badge";
import Alert from "@cloudscape-design/components/alert";
import Tabs from "@cloudscape-design/components/tabs";
import Icon from "@cloudscape-design/components/icon";
import { useAuth } from "../lib/auth-context";
import { supabase, type Favorite } from "../lib/supabase";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (loading) return;
    if (!user) { setDataLoading(false); return; }
    supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setFavorites((data as Favorite[]) || []);
        setDataLoading(false);
      });
  }, [user, loading]);

  async function removeFavorite(id: string) {
    if (!user) return;
    const { error } = await supabase.from("favorites").delete().eq("id", id).eq("user_id", user.id);
    if (error) { setError(error.message); return; }
    setFavorites(prev => prev.filter(f => f.id !== id));
  }

  const tabItems = (type: string) => {
    if (type === "all") return favorites;
    return favorites.filter(f => f.place_type === type);
  };

  if (loading || dataLoading) {
    return (
      <ContentLayout header={<Header variant="h1">Favorites</Header>}>
        <Container><Box textAlign="center" padding="xl">Loading your favorites...</Box></Container>
      </ContentLayout>
    );
  }

  if (!user) {
    return (
      <ContentLayout header={<Header variant="h1">Favorites</Header>}>
        <Container>
          <Box textAlign="center" padding="xl">
            <SpaceBetween size="m" alignItems="center">
              <Icon name="lock-private" size="large" />
              <Box variant="h3">Sign in to view your favorites</Box>
              <Box color="text-body-secondary">Save destinations, restaurants, and hotels to your favorites list</Box>
              <Button variant="primary" onClick={() => navigate("/explore")}>Explore Destinations</Button>
            </SpaceBetween>
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  const TYPE_COLORS: Record<string, "blue" | "green" | "grey"> = {
    destination: "blue",
    restaurant: "green",
    hotel: "blue",
    attraction: "grey",
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={`${favorites.length} saved item${favorites.length !== 1 ? "s" : ""}`}
        >
          Favorites
        </Header>
      }
    >
      <SpaceBetween size="l">
        {error && <Alert type="error" dismissible onDismiss={() => setError("")}>{error}</Alert>}

        {favorites.length === 0 ? (
          <Container>
            <Box textAlign="center" padding="xl">
              <SpaceBetween size="m" alignItems="center">
                <Icon name="heart" size="large" />
                <Box variant="h3">No favorites yet</Box>
                <Box color="text-body-secondary">Click the heart icon on any destination, restaurant, or hotel to save it here</Box>
                <Button variant="primary" onClick={() => navigate("/explore")}>Explore Destinations</Button>
              </SpaceBetween>
            </Box>
          </Container>
        ) : (
          <Container>
            <Tabs
              activeTabId={activeTab}
              onChange={e => setActiveTab(e.detail.activeTabId)}
              tabs={[
                { id: "all", label: `All (${favorites.length})` },
                { id: "destination", label: `Destinations (${tabItems("destination").length})` },
                { id: "restaurant", label: `Restaurants (${tabItems("restaurant").length})` },
                { id: "hotel", label: `Hotels (${tabItems("hotel").length})` },
              ]}
            />
            <Box margin={{ top: "m" }}>
              <Grid gridDefinition={tabItems(activeTab).map(() => ({ colspan: { default: 12, xs: 6, s: 4 } }))}>
                {tabItems(activeTab).map(fav => (
                  <Container key={fav.id}>
                    <SpaceBetween size="s">
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        <Box variant="h4">{fav.place_name}</Box>
                        <Badge color={TYPE_COLORS[fav.place_type] || "grey"}>{fav.place_type}</Badge>
                      </SpaceBetween>
                      {fav.place_data && (fav.place_data as { image?: string }).image && (
                        <img
                          src={(fav.place_data as { image: string }).image}
                          alt={fav.place_name}
                          style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }}
                        />
                      )}
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button
                          variant="normal"
                          iconName="external"
                          onClick={() => {
                            if (fav.place_type === "destination") {
                              navigate(`/destination/${fav.place_id}`);
                            } else {
                              navigate(fav.place_type === "restaurant" ? "/food" : "/hotels");
                            }
                          }}
                        >
                          View
                        </Button>
                        <Button variant="normal" iconName="remove" onClick={() => removeFavorite(fav.id)}>
                          Remove
                        </Button>
                      </SpaceBetween>
                    </SpaceBetween>
                  </Container>
                ))}
              </Grid>
            </Box>
          </Container>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
