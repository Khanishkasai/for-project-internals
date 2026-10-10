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
import Modal from "@cloudscape-design/components/modal";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Icon from "@cloudscape-design/components/icon";
import { useAuth } from "../lib/auth-context";
import { supabase, type SavedTrip } from "../lib/supabase";
import { exportItineraryPDF } from "../lib/pdf-export";

export default function SavedTripsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { setDataLoading(false); return; }
    supabase
      .from("saved_trips")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setTrips((data as SavedTrip[]) || []);
        setDataLoading(false);
      });
  }, [user, loading]);

  async function deleteTrip() {
    if (!deleteId || !user) return;
    const { error } = await supabase.from("saved_trips").delete().eq("id", deleteId).eq("user_id", user.id);
    if (error) { setError(error.message); return; }
    setTrips(prev => prev.filter(t => t.id !== deleteId));
    setDeleteId(null);
  }

  if (loading || dataLoading) {
    return (
      <ContentLayout header={<Header variant="h1">Saved Trips</Header>}>
        <Container><Box textAlign="center" padding="xl">Loading your trips...</Box></Container>
      </ContentLayout>
    );
  }

  if (!user) {
    return (
      <ContentLayout header={<Header variant="h1">Saved Trips</Header>}>
        <Container>
          <Box textAlign="center" padding="xl">
            <SpaceBetween size="m" alignItems="center">
              <Icon name="lock-private" size="large" />
              <Box variant="h3">Sign in to view your saved trips</Box>
              <Box color="text-body-secondary">Create an account to save and manage your itineraries</Box>
              <Button variant="primary" onClick={() => navigate("/itinerary")}>Plan a Trip</Button>
            </SpaceBetween>
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={`${trips.length} saved trip${trips.length !== 1 ? "s" : ""}`}
          actions={<Button variant="primary" onClick={() => navigate("/itinerary")} iconName="gen-ai">Plan New Trip</Button>}
        >
          Saved Trips
        </Header>
      }
    >
      <SpaceBetween size="l">
        {error && <Alert type="error" dismissible onDismiss={() => setError("")}>{error}</Alert>}

        {trips.length === 0 ? (
          <Container>
            <Box textAlign="center" padding="xl">
              <SpaceBetween size="m" alignItems="center">
                <Icon name="ticket" size="large" />
                <Box variant="h3">No saved trips yet</Box>
                <Box color="text-body-secondary">Generate an itinerary and save it to see it here</Box>
                <Button variant="primary" onClick={() => navigate("/itinerary")}>Create Your First Trip</Button>
              </SpaceBetween>
            </Box>
          </Container>
        ) : (
          <Grid gridDefinition={trips.map(() => ({ colspan: { default: 12, xs: 6, s: 4 } }))}>
            {trips.map(trip => (
              <Container key={trip.id}>
                <SpaceBetween size="s">
                  {trip.cover_image && (
                    <img src={trip.cover_image} alt={trip.destination} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
                  )}
                  <Box variant="h3">{trip.title}</Box>
                  <Box color="text-body-secondary" fontSize="body-s">{trip.destination}</Box>
                  <ColumnLayout columns={2} borders="none">
                    <Box fontSize="body-s"><strong>Travelers:</strong> {trip.travelers}</Box>
                    <Box fontSize="body-s"><strong>Budget:</strong> ${trip.budget}</Box>
                    {trip.start_date && <Box fontSize="body-s"><strong>From:</strong> {trip.start_date}</Box>}
                    {trip.end_date && <Box fontSize="body-s"><strong>To:</strong> {trip.end_date}</Box>}
                  </ColumnLayout>
                  {trip.itinerary_data && Array.isArray(trip.itinerary_data) && (
                    <Badge color="blue">{trip.itinerary_data.length} days</Badge>
                  )}
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => exportItineraryPDF(trip.destination, trip.itinerary_data, { travelers: trip.travelers, budget: Number(trip.budget), totalCost: Number(trip.budget) })} iconName="download">
                      PDF
                    </Button>
                    <Button variant="normal" iconName="external" onClick={() => navigate(`/destination/${trip.destination.toLowerCase().replace(/\s+/g, "-")}`)}>
                      View
                    </Button>
                    <Button variant="normal" iconName="delete-marker" onClick={() => setDeleteId(trip.id)}>
                      Delete
                    </Button>
                  </SpaceBetween>
                </SpaceBetween>
              </Container>
            ))}
          </Grid>
        )}
      </SpaceBetween>

      <Modal
        visible={!!deleteId}
        onDismiss={() => setDeleteId(null)}
        header="Delete Trip?"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="primary" onClick={deleteTrip}>Delete</Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box>Are you sure you want to delete this trip? This action cannot be undone.</Box>
      </Modal>
    </ContentLayout>
  );
}
