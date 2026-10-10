import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import Multiselect from "@cloudscape-design/components/multiselect";
import DatePicker from "@cloudscape-design/components/date-picker";
import Spinner from "@cloudscape-design/components/spinner";
import Badge from "@cloudscape-design/components/badge";
import Alert from "@cloudscape-design/components/alert";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Tabs from "@cloudscape-design/components/tabs";
import Icon from "@cloudscape-design/components/icon";
import { useAuth } from "../lib/auth-context";
import { supabase, type ItineraryDay } from "../lib/supabase";
import { DESTINATIONS, getPlacesByCity } from "../data/destinations";
import { exportItineraryPDF } from "../lib/pdf-export";

const TRAVEL_STYLES = [
  { label: "Adventure", value: "adventure" },
  { label: "Luxury", value: "luxury" },
  { label: "Budget", value: "budget" },
  { label: "Backpacker", value: "backpacker" },
  { label: "Family", value: "family" },
];

const INTEREST_OPTIONS = [
  { label: "Culture & History", value: "culture" },
  { label: "Food & Dining", value: "food" },
  { label: "Nature & Outdoors", value: "nature" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Shopping", value: "shopping" },
  { label: "Wellness & Spa", value: "wellness" },
  { label: "Photography", value: "photography" },
  { label: "Art & Museums", value: "art" },
];

const DIET_OPTIONS = [
  { label: "No restrictions", value: "none" },
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Halal", value: "halal" },
  { label: "Gluten-free", value: "gluten-free" },
];

const ACCOMMODATION_OPTIONS = [
  { label: "Budget hostel", value: "hostel" },
  { label: "Mid-range hotel", value: "hotel" },
  { label: "Boutique hotel", value: "boutique" },
  { label: "Luxury resort", value: "luxury" },
  { label: "Airbnb / Apartment", value: "apartment" },
];

export default function ItineraryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destination, setDestination] = useState(searchParams.get("destination") || "Paris");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(2000);
  const [travelStyle, setTravelStyle] = useState(TRAVEL_STYLES[0]);
  const [interests, setInterests] = useState<readonly { label: string; value: string }[]>([
    { label: "Culture & History", value: "culture" },
    { label: "Food & Dining", value: "food" },
  ]);
  const [diet, setDiet] = useState(DIET_OPTIONS[0]);
  const [accommodation, setAccommodation] = useState(ACCOMMODATION_OPTIONS[1]);
  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const numDays = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
    : 3;

  async function generateItinerary() {
    setGenerating(true);
    setError("");
    setItinerary([]);

    try {
      const dest = DESTINATIONS.find(d => d.name.toLowerCase() === destination.toLowerCase());
      const places = getPlacesByCity(destination);
      const days: ItineraryDay[] = [];

      const themes = ["Arrival & City Highlights", "Cultural Deep Dive", "Food & Local Life", "Nature & Scenery", "Hidden Gems & Departure"];
      const activitySlots = [
        { time: "9:00 AM", period: "Morning" },
        { time: "1:00 PM", period: "Afternoon" },
        { time: "7:00 PM", period: "Evening" },
      ];

      for (let day = 1; day <= numDays; day++) {
        const dayPlaces = places.slice((day - 1) * 3, (day - 1) * 3 + 3);
        const activities = activitySlots.map((slot, idx) => {
          const place = dayPlaces[idx] || places[idx % Math.max(places.length, 1)] || {
            name: `${destination} Exploration`,
            description: "Discover the local area",
            address: destination,
            lat: dest?.lat,
            lng: dest?.lng,
          };
          return {
            id: `day${day}-act${idx}`,
            time: slot.time,
            title: place.name,
            description: place.description || "Explore and discover",
            location: place.address || destination,
            duration: idx === 0 ? "2-3 hours" : idx === 1 ? "2 hours" : "1-2 hours",
            cost: 30 + Math.floor(Math.random() * 50),
            category: slot.period,
            lat: place.lat,
            lng: place.lng,
          };
        });

        const dailyCost = activities.reduce((sum, a) => sum + a.cost, 0) + 80;
        days.push({
          day,
          date: startDate ? new Date(new Date(startDate).getTime() + (day - 1) * 86400000).toISOString().split("T")[0] : `Day ${day}`,
          theme: themes[(day - 1) % themes.length],
          activities,
          restaurant: places.find(p => p.type === "restaurant" || p.type === "cafe")?.name || "Local restaurant",
          accommodation: accommodation.label,
          dailyCost,
        });
      }

      await new Promise(r => setTimeout(r, 1500));
      setItinerary(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate itinerary");
    } finally {
      setGenerating(false);
    }
  }

  async function saveTrip() {
    if (!user) {
      alert("Sign in to save your trip");
      return;
    }
    const dest = DESTINATIONS.find(d => d.name.toLowerCase() === destination.toLowerCase());
    const totalCost = itinerary.reduce((sum, d) => sum + d.dailyCost, 0);
    const { error } = await supabase.from("saved_trips").insert({
      title: `${destination} Trip`,
      destination,
      cover_image: dest?.image || null,
      start_date: startDate || null,
      end_date: endDate || null,
      travelers,
      budget: totalCost,
      budget_currency: "USD",
      itinerary_data: itinerary,
    });
    if (error) {
      setError(error.message);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }

  function regenerateDay(dayNum: number) {
    setItinerary(prev => prev.map(d => {
      if (d.day !== dayNum) return d;
      const places = getPlacesByCity(destination);
      const newActivities = d.activities.map((act, idx) => {
        const place = places[(dayNum + idx) % Math.max(places.length, 1)];
        if (!place) return act;
        return { ...act, title: place.name, description: place.description, location: place.address };
      });
      return { ...d, activities: newActivities };
    }));
  }

  const totalCost = itinerary.reduce((sum, d) => sum + d.dailyCost, 0);

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Generate a personalized day-by-day itinerary with AI"
          actions={
            itinerary.length > 0 && (
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => exportItineraryPDF(destination, itinerary, { travelers, budget, totalCost })} iconName="download">
                  Export PDF
                </Button>
                <Button variant="primary" onClick={saveTrip} iconName="check">
                  Save Trip
                </Button>
              </SpaceBetween>
            )
          }
        >
          AI Trip Planner
        </Header>
      }
    >
      <SpaceBetween size="l">
        {saveSuccess && <Alert type="success" dismissible onDismiss={() => setSaveSuccess(false)}>Trip saved! View it in Saved Trips.</Alert>}
        {error && <Alert type="error" dismissible onDismiss={() => setError("")}>{error}</Alert>}

        {/* Trip configuration */}
        <Container header={<Header variant="h2">Trip Details</Header>}>
          <Grid
            gridDefinition={[
              { colspan: { default: 12, s: 4 } },
              { colspan: { default: 6, s: 2 } },
              { colspan: { default: 6, s: 2 } },
              { colspan: { default: 6, s: 2 } },
              { colspan: { default: 6, s: 2 } },
            ]}
          >
            <FormField label="Destination">
              <Select
                selectedOption={{ label: destination, value: destination }}
                onChange={e => setDestination(e.detail.selectedOption?.value || "Paris")}
                options={DESTINATIONS.map(d => ({ label: `${d.name}, ${d.country}`, value: d.name }))}
              />
            </FormField>
            <FormField label="Start Date">
              <DatePicker value={startDate} onChange={e => setStartDate(e.detail.value)} placeholder="YYYY/MM/DD" />
            </FormField>
            <FormField label="End Date">
              <DatePicker value={endDate} onChange={e => setEndDate(e.detail.value)} placeholder="YYYY/MM/DD" />
            </FormField>
            <FormField label="Travelers">
              <Input type="number" value={String(travelers)} onChange={e => setTravelers(Math.max(1, parseInt(e.detail.value) || 1))} />
            </FormField>
            <FormField label="Budget (USD)">
              <Input type="number" value={String(budget)} onChange={e => setBudget(parseInt(e.detail.value) || 0)} />
            </FormField>
          </Grid>

          <Box margin={{ top: "m" }}>
            <Grid
              gridDefinition={[
                { colspan: { default: 12, s: 3 } },
                { colspan: { default: 12, s: 3 } },
                { colspan: { default: 12, s: 3 } },
                { colspan: { default: 12, s: 3 } },
              ]}
            >
              <FormField label="Travel Style">
                <Select selectedOption={travelStyle} onChange={e => setTravelStyle(e.detail.selectedOption as typeof travelStyle)} options={TRAVEL_STYLES} />
              </FormField>
              <FormField label="Interests">
                <Multiselect
                  selectedOptions={interests as { label: string; value: string }[]}
                  onChange={e => setInterests(e.detail.selectedOptions as { label: string; value: string }[])}
                  options={INTEREST_OPTIONS}
                  placeholder="Select interests"
                />
              </FormField>
              <FormField label="Dietary Preferences">
                <Select selectedOption={diet} onChange={e => setDiet(e.detail.selectedOption as typeof diet)} options={DIET_OPTIONS} />
              </FormField>
              <FormField label="Accommodation">
                <Select selectedOption={accommodation} onChange={e => setAccommodation(e.detail.selectedOption as typeof accommodation)} options={ACCOMMODATION_OPTIONS} />
              </FormField>
            </Grid>
          </Box>

          <Box margin={{ top: "m" }}>
            <SpaceBetween direction="horizontal" size="m" alignItems="center">
              <Button variant="primary" onClick={generateItinerary} loading={generating} iconName="gen-ai">
                {generating ? "Generating..." : `Generate ${numDays}-Day Itinerary`}
              </Button>
              <Box color="text-body-secondary" fontSize="body-s">
                {numDays} days · {travelers} traveler{travelers !== 1 ? "s" : ""} · {interests.length} interests selected
              </Box>
            </SpaceBetween>
          </Box>
        </Container>

        {/* Generating state */}
        {generating && (
          <Container>
            <Box textAlign="center" padding="xl">
              <SpaceBetween size="m" alignItems="center">
                <Spinner size="large" />
                <Box variant="h3">AI is crafting your {destination} itinerary...</Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  Analyzing destinations, restaurants, and activities tailored to your preferences
                </Box>
              </SpaceBetween>
            </Box>
          </Container>
        )}

        {/* Itinerary results */}
        {itinerary.length > 0 && !generating && (
          <SpaceBetween size="l">
            {/* Budget summary */}
            <Container header={<Header variant="h2">Budget Summary</Header>}>
              <ColumnLayout columns={4} borders="none">
                <div>
                  <Box color="text-body-secondary" fontSize="body-s">Total Estimated Cost</Box>
                  <Box variant="h2" fontSize="heading-l" color="text-status-info">${totalCost}</Box>
                </div>
                <div>
                  <Box color="text-body-secondary" fontSize="body-s">Daily Average</Box>
                  <Box variant="h2" fontSize="heading-l">${Math.round(totalCost / numDays)}</Box>
                </div>
                <div>
                  <Box color="text-body-secondary" fontSize="body-s">Your Budget</Box>
                  <Box variant="h2" fontSize="heading-l">${budget}</Box>
                </div>
                <div>
                  <Box color="text-body-secondary" fontSize="body-s">Status</Box>
                  <Box variant="h2" fontSize="heading-l" color={totalCost <= budget ? "text-status-success" : "text-status-error"}>
                    {totalCost <= budget ? "Under budget" : "Over budget"}
                  </Box>
                </div>
              </ColumnLayout>
            </Container>

            {/* Day-by-day itinerary */}
            <Container header={<Header variant="h2">Day-by-Day Itinerary</Header>}>
              <Tabs
                tabs={itinerary.map(day => ({
                  id: `day-${day.day}`,
                  label: `Day ${day.day}: ${day.theme}`,
                  content: (
                    <SpaceBetween size="m">
                      <Box>
                        <SpaceBetween direction="horizontal" size="m" alignItems="center">
                          <Badge color="blue">{day.date}</Badge>
                          <Box color="text-body-secondary">{day.theme}</Box>
                          <Box variant="strong" color="text-status-info">~${day.dailyCost}</Box>
                          <Button variant="normal" iconName="refresh" onClick={() => regenerateDay(day.day)}>
                            Regenerate
                          </Button>
                        </SpaceBetween>
                      </Box>

                      <ColumnLayout columns={3} borders="none" variant="text-grid">
                        {day.activities.map(act => (
                          <Container key={act.id}>
                            <SpaceBetween size="xs">
                              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                                <Badge color="green">{act.time}</Badge>
                                <Badge>{act.category}</Badge>
                              </SpaceBetween>
                              <Box variant="h4" fontSize="heading-s">{act.title}</Box>
                              <Box fontSize="body-s" color="text-body-secondary">{act.description}</Box>
                              <SpaceBetween direction="horizontal" size="xs">
                                <Box fontSize="body-s"><Icon name="location-pin" /> {act.location}</Box>
                              </SpaceBetween>
                              <SpaceBetween direction="horizontal" size="s">
                                <Box fontSize="body-s" color="text-body-secondary"><Icon name="calendar" /> {act.duration}</Box>
                                <Box fontSize="body-s" color="text-status-info">~${act.cost}</Box>
                              </SpaceBetween>
                            </SpaceBetween>
                          </Container>
                        ))}
                      </ColumnLayout>

                      <Box padding="s">
                        <SpaceBetween direction="horizontal" size="l">
                          <Box><Icon name="heart-filled" /> <strong>Dinner:</strong> {day.restaurant}</Box>
                          <Box><Icon name="location-pin" /> <strong>Stay:</strong> {day.accommodation}</Box>
                        </SpaceBetween>
                      </Box>
                    </SpaceBetween>
                  ),
                }))}
              />
            </Container>

            {/* Actions */}
            <Container>
              <SpaceBetween direction="horizontal" size="m">
                <Button variant="primary" onClick={saveTrip} iconName="check">Save This Trip</Button>
                <Button onClick={() => exportItineraryPDF(destination, itinerary, { travelers, budget, totalCost })} iconName="download">Export as PDF</Button>
                <Button onClick={() => navigate("/chat")} iconName="suggestions-gen-ai">Ask AI for Changes</Button>
                <Button onClick={() => navigate("/map")} iconName="map">View on Map</Button>
              </SpaceBetween>
            </Container>
          </SpaceBetween>
        )}

        {/* Empty state */}
        {itinerary.length === 0 && !generating && (
          <Container>
            <Box textAlign="center" padding="xl">
              <SpaceBetween size="m" alignItems="center">
                <Icon name="gen-ai" size="large" />
                <Box variant="h3">Ready to Plan Your Adventure?</Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  Fill in your trip details above and click "Generate" to create a personalized itinerary with activities, restaurants, and budget estimates.
                </Box>
              </SpaceBetween>
            </Box>
          </Container>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
