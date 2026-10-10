import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import Multiselect from "@cloudscape-design/components/multiselect";
import Badge from "@cloudscape-design/components/badge";
import TextFilter from "@cloudscape-design/components/text-filter";
import { DESTINATIONS } from "../data/destinations";
import { DestinationCard } from "../components/DestinationCard";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";

const REGIONS = [
  { label: "All Regions", value: "" },
  { label: "Europe", value: "Europe" },
  { label: "Asia", value: "Asia" },
  { label: "North America", value: "North America" },
  { label: "Middle East", value: "Middle East" },
  { label: "Oceania", value: "Oceania" },
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: "" },
  { label: "Budget ($0–100/day)", value: "budget" },
  { label: "Mid-range ($100–200/day)", value: "mid" },
  { label: "Luxury ($200+/day)", value: "luxury" },
];

const ALL_TAGS = ["beach", "culture", "food", "romance", "adventure", "history", "architecture", "nature", "luxury", "shopping", "nightlife", "wellness"];

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [filterText, setFilterText] = useState(searchParams.get("q") || "");
  const [region, setRegion] = useState(REGIONS[0]);
  const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
  const [selectedTags, setSelectedTags] = useState<{ label: string; value: string }[]>(
    searchParams.get("tag") ? [{ label: searchParams.get("tag")!, value: searchParams.get("tag")! }] : []
  );
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState({ label: "Top Rated", value: "rating" });

  const filtered = useMemo(() => {
    let result = [...DESTINATIONS];

    if (filterText) {
      const q = filterText.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.tags.some(t => t.includes(q))
      );
    }

    if (region.value) {
      result = result.filter(d => d.region === region.value);
    }

    if (selectedTags.length > 0) {
      const tagValues = selectedTags.map(t => t.value);
      result = result.filter(d => tagValues.some(t => d.tags.includes(t)));
    }

    if (budget.value === "budget") {
      result = result.filter(d => d.budget.includes("$50") || d.budget.includes("$100"));
    } else if (budget.value === "luxury") {
      result = result.filter(d => d.budget.includes("$200") || d.budget.includes("$300") || d.budget.includes("$400"));
    }

    result.sort((a, b) => {
      if (sortBy.value === "rating") return b.rating - a.rating;
      if (sortBy.value === "name") return a.name.localeCompare(b.name);
      return b.reviewCount - a.reviewCount;
    });

    return result;
  }, [filterText, region, selectedTags, budget, sortBy]);

  async function toggleFavorite(id: string) {
    if (!user) {
      alert("Sign in to save favorites");
      return;
    }
    const dest = DESTINATIONS.find(d => d.id === id);
    if (!dest) return;
    if (favorites.has(id)) {
      await supabase.from("favorites").delete().eq("place_id", id).eq("user_id", user.id);
      setFavorites(prev => { const s = new Set(prev); s.delete(id); return s; });
    } else {
      await supabase.from("favorites").insert({
        place_id: id,
        place_name: dest.name,
        place_type: "destination",
        place_data: dest as unknown as Record<string, unknown>,
      });
      setFavorites(prev => new Set([...prev, id]));
    }
  }

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={`${filtered.length} destination${filtered.length !== 1 ? "s" : ""} found`}
          actions={
            <Button variant="primary" onClick={() => navigate("/map")} iconName="map">
              View on Map
            </Button>
          }
        >
          Explore Destinations
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="m">
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
                filteringPlaceholder="Search destinations..."
                countText={`${filtered.length} results`}
              />
              <Select
                selectedOption={region}
                onChange={e => setRegion(e.detail.selectedOption as typeof region)}
                options={REGIONS}
              />
              <Select
                selectedOption={budget}
                onChange={e => setBudget(e.detail.selectedOption as typeof budget)}
                options={BUDGET_OPTIONS}
              />
              <Multiselect
                selectedOptions={selectedTags}
                onChange={e => setSelectedTags(e.detail.selectedOptions as typeof selectedTags)}
                options={ALL_TAGS.map(t => ({ label: t, value: t }))}
                placeholder="Filter by interest"
              />
              <Select
                selectedOption={sortBy}
                onChange={e => setSortBy(e.detail.selectedOption as typeof sortBy)}
                options={[
                  { label: "Top Rated", value: "rating" },
                  { label: "Most Reviewed", value: "reviews" },
                  { label: "A–Z", value: "name" },
                ]}
              />
            </Grid>
          </SpaceBetween>
        </Container>

        {filtered.length === 0 ? (
          <Container>
            <Box textAlign="center" padding="xxl">
              <SpaceBetween size="m" alignItems="center">
                <Box fontSize="heading-l">No destinations found</Box>
                <Box color="text-body-secondary">Try adjusting your search or filters</Box>
                <Button onClick={() => { setFilterText(""); setRegion(REGIONS[0]); setSelectedTags([]); }}>
                  Clear filters
                </Button>
              </SpaceBetween>
            </Box>
          </Container>
        ) : (
          <Grid
            gridDefinition={filtered.map(() => ({ colspan: { default: 12, xs: 6, s: 4 } }))}
          >
            {filtered.map(dest => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onNavigate={id => navigate(`/destination/${id}`)}
                onFavorite={toggleFavorite}
                isFavorited={favorites.has(dest.id)}
              />
            ))}
          </Grid>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
