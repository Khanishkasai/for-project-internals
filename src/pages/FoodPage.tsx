import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Select from "@cloudscape-design/components/select";
import TextFilter from "@cloudscape-design/components/text-filter";
import Badge from "@cloudscape-design/components/badge";
import { PLACES, RESTAURANTS, type Place } from "../data/destinations";
import { PlaceCard } from "../components/PlaceCard";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";

const CITIES = [
  { label: "All Cities", value: "" },
  ...Array.from(new Set(PLACES.map(p => p.city))).map(c => ({ label: c, value: c })),
];

const CUISINES = [
  { label: "All Cuisines", value: "" },
  { label: "French", value: "French" },
  { label: "Japanese", value: "Japanese" },
  { label: "Indonesian", value: "Indonesian" },
];

const SORT_OPTIONS = [
  { label: "Top Rated", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
];

export default function FoodPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filterText, setFilterText] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [cuisine, setCuisine] = useState(CUISINES[0]);
  const [maxPrice, setMaxPrice] = useState({ label: "Any Price", value: "4" });
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const filtered = useMemo(() => {
    let result = [...RESTAURANTS];
    if (filterText) {
      const q = filterText.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    if (city.value) result = result.filter(p => p.city === city.value);
    if (cuisine.value) result = result.filter(p => p.cuisine === cuisine.value);
    result = result.filter(p => p.priceLevel <= parseInt(maxPrice.value));

    result.sort((a, b) => {
      if (sortBy.value === "rating") return b.rating - a.rating;
      if (sortBy.value === "reviews") return b.reviewCount - a.reviewCount;
      if (sortBy.value === "priceAsc") return a.priceLevel - b.priceLevel;
      return b.priceLevel - a.priceLevel;
    });
    return result;
  }, [filterText, city, cuisine, maxPrice, sortBy]);

  async function toggleFavorite(id: string) {
    if (!user) { alert("Sign in to save favorites"); return; }
    const place = PLACES.find(p => p.id === id);
    if (!place) return;
    if (favorites.has(id)) {
      await supabase.from("favorites").delete().eq("place_id", id).eq("user_id", user.id);
      setFavorites(prev => { const s = new Set(prev); s.delete(id); return s; });
    } else {
      await supabase.from("favorites").insert({
        place_id: id, place_name: place.name, place_type: "restaurant",
        place_data: place as unknown as Record<string, unknown>,
      });
      setFavorites(prev => new Set([...prev, id]));
    }
  }

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={`${filtered.length} restaurant${filtered.length !== 1 ? "s" : ""} and cafes found`}
          actions={<Button variant="primary" onClick={() => navigate("/map")} iconName="map">View on Map</Button>}
        >
          Food & Restaurants
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container>
          <Grid
            gridDefinition={[
              { colspan: { default: 12, s: 4 } },
              { colspan: { default: 12, xs: 6, s: 2 } },
              { colspan: { default: 12, xs: 6, s: 2 } },
              { colspan: { default: 12, xs: 6, s: 2 } },
              { colspan: { default: 12, xs: 6, s: 2 } },
            ]}
          >
            <TextFilter
              filteringText={filterText}
              onChange={e => setFilterText(e.detail.filteringText)}
              filteringPlaceholder="Search restaurants..."
              countText={`${filtered.length} results`}
            />
            <Select selectedOption={city} onChange={e => setCity(e.detail.selectedOption as typeof city)} options={CITIES} />
            <Select selectedOption={cuisine} onChange={e => setCuisine(e.detail.selectedOption as typeof cuisine)} options={CUISINES} />
            <Select
              selectedOption={maxPrice}
              onChange={e => setMaxPrice(e.detail.selectedOption as typeof maxPrice)}
              options={[
                { label: "Any Price", value: "4" },
                { label: "$ Budget", value: "1" },
                { label: "$ Moderate", value: "2" },
                { label: "$$ Upscale", value: "3" },
                { label: "$$ Fine Dining", value: "4" },
              ]}
            />
            <Select selectedOption={sortBy} onChange={e => setSortBy(e.detail.selectedOption as typeof sortBy)} options={SORT_OPTIONS} />
          </Grid>
        </Container>

        {filtered.length === 0 ? (
          <Container>
            <Box textAlign="center" padding="xl">
              <SpaceBetween size="m" alignItems="center">
                <Box fontSize="heading-l">No restaurants found</Box>
                <Box color="text-body-secondary">Try adjusting your filters</Box>
                <Button onClick={() => { setFilterText(""); setCity(CITIES[0]); setCuisine(CUISINES[0]); setMaxPrice({ label: "Any Price", value: "4" }); }}>
                  Clear filters
                </Button>
              </SpaceBetween>
            </Box>
          </Container>
        ) : (
          <Grid gridDefinition={filtered.map(() => ({ colspan: { default: 12, xs: 6, s: 4 } }))}>
            {filtered.map(place => (
              <PlaceCard
                key={place.id}
                place={place}
                onFavorite={toggleFavorite}
                isFavorited={favorites.has(place.id)}
                onSelect={setSelectedPlace}
              />
            ))}
          </Grid>
        )}

        {/* Detail modal */}
        {selectedPlace && (
          <Container
            header={
              <Header
                variant="h2"
                actions={<Button variant="icon" iconName="close" onClick={() => setSelectedPlace(null)} />}
              >
                {selectedPlace.name}
              </Header>
            }
          >
            <SpaceBetween size="m">
              <img src={selectedPlace.image} alt={selectedPlace.name} style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 8 }} />
              <Box fontSize="body-m">{selectedPlace.description}</Box>
              <Grid gridDefinition={[{ colspan: { default: 6 } }, { colspan: { default: 6 } }]}>
                <Box><strong>Address:</strong> {selectedPlace.address}</Box>
                <Box><strong>Hours:</strong> {selectedPlace.openHours}</Box>
              </Grid>
              <SpaceBetween direction="horizontal" size="xs">
                {selectedPlace.tags.map(t => <Badge key={t} color="grey">{t}</Badge>)}
              </SpaceBetween>
              <Button
                variant="primary"
                onClick={() => navigate(`/map?city=${selectedPlace.city}&lat=${selectedPlace.lat}&lng=${selectedPlace.lng}`)}
                iconName="map"
              >
                View on Map
              </Button>
            </SpaceBetween>
          </Container>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
