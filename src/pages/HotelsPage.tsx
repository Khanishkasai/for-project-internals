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
import Multiselect from "@cloudscape-design/components/multiselect";
import TextFilter from "@cloudscape-design/components/text-filter";
import Badge from "@cloudscape-design/components/badge";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import { HOTELS, type Place } from "../data/destinations";
import { PlaceCard } from "../components/PlaceCard";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";

const SORT_OPTIONS = [
  { label: "Top Rated", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
];

const AMENITY_OPTIONS = [
  { label: "Pool", value: "pool" },
  { label: "Spa", value: "spa" },
  { label: "Gym", value: "gym" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Bar", value: "bar" },
  { label: "Concierge", value: "concierge" },
];

export default function HotelsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [maxPrice, setMaxPrice] = useState({ label: "Any Price", value: "4" });
  const [selectedAmenities, setSelectedAmenities] = useState<readonly { label: string; value: string }[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const filtered = useMemo(() => {
    let result = [...HOTELS];
    if (filterText) {
      const q = filterText.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }
    result = result.filter(p => p.priceLevel <= parseInt(maxPrice.value));
    if (selectedAmenities.length > 0) {
      const amenityValues = selectedAmenities.map(a => a.value);
      result = result.filter(p => p.amenities?.some(a => amenityValues.includes(a)));
    }

    result.sort((a, b) => {
      if (sortBy.value === "rating") return b.rating - a.rating;
      if (sortBy.value === "reviews") return b.reviewCount - a.reviewCount;
      if (sortBy.value === "priceAsc") return a.priceLevel - b.priceLevel;
      return b.priceLevel - a.priceLevel;
    });
    return result;
  }, [filterText, maxPrice, selectedAmenities, sortBy]);

  async function toggleFavorite(id: string) {
    if (!user) { alert("Sign in to save favorites"); return; }
    const place = HOTELS.find(p => p.id === id);
    if (!place) return;
    if (favorites.has(id)) {
      await supabase.from("favorites").delete().eq("place_id", id).eq("user_id", user.id);
      setFavorites(prev => { const s = new Set(prev); s.delete(id); return s; });
    } else {
      await supabase.from("favorites").insert({
        place_id: id, place_name: place.name, place_type: "hotel",
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
          description={`${filtered.length} hotel${filtered.length !== 1 ? "s" : ""} and accommodations found`}
          actions={<Button variant="primary" onClick={() => navigate("/map")} iconName="map">View on Map</Button>}
        >
          Hotels & Stays
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container>
          <Grid
            gridDefinition={[
              { colspan: { default: 12, s: 4 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, s: 2 } },
            ]}
          >
            <TextFilter
              filteringText={filterText}
              onChange={e => setFilterText(e.detail.filteringText)}
              filteringPlaceholder="Search hotels..."
              countText={`${filtered.length} results`}
            />
            <Select
              selectedOption={maxPrice}
              onChange={e => setMaxPrice(e.detail.selectedOption as typeof maxPrice)}
              options={[
                { label: "Any Price", value: "4" },
                { label: "$ Budget", value: "1" },
                { label: "$ Moderate", value: "2" },
                { label: "$$ Upscale", value: "3" },
                { label: "$$ Luxury", value: "4" },
              ]}
            />
            <Multiselect
              selectedOptions={selectedAmenities as { label: string; value: string }[]}
              onChange={e => setSelectedAmenities(e.detail.selectedOptions as { label: string; value: string }[])}
              options={AMENITY_OPTIONS}
              placeholder="Filter by amenities"
            />
            <Select selectedOption={sortBy} onChange={e => setSortBy(e.detail.selectedOption as typeof sortBy)} options={SORT_OPTIONS} />
          </Grid>
        </Container>

        {filtered.length === 0 ? (
          <Container>
            <Box textAlign="center" padding="xl">
              <SpaceBetween size="m" alignItems="center">
                <Box fontSize="heading-l">No hotels found</Box>
                <Box color="text-body-secondary">Try adjusting your filters</Box>
                <Button onClick={() => { setFilterText(""); setMaxPrice({ label: "Any Price", value: "4" }); setSelectedAmenities([]); }}>
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
              <ColumnLayout columns={2} borders="none">
                <Box><strong>Address:</strong> {selectedPlace.address}</Box>
                <Box><strong>Rating:</strong> {selectedPlace.rating} ({selectedPlace.reviewCount.toLocaleString()} reviews)</Box>
              </ColumnLayout>
              {selectedPlace.amenities && (
                <SpaceBetween direction="horizontal" size="xs">
                  {selectedPlace.amenities.map(a => <Badge key={a} color="blue">{a}</Badge>)}
                </SpaceBetween>
              )}
              <Button variant="primary" onClick={() => navigate(`/map?city=${selectedPlace.city}&lat=${selectedPlace.lat}&lng=${selectedPlace.lng}`)} iconName="map">
                View on Map
              </Button>
            </SpaceBetween>
          </Container>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
