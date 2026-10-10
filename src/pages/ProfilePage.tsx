import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import Textarea from "@cloudscape-design/components/textarea";
import Alert from "@cloudscape-design/components/alert";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Badge from "@cloudscape-design/components/badge";
import Icon from "@cloudscape-design/components/icon";
import { useAuth } from "../lib/auth-context";
import { supabase, type SavedTrip, type Favorite } from "../lib/supabase";

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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [homeCountry, setHomeCountry] = useState(profile?.home_country || "");
  const [preferredCurrency, setPreferredCurrency] = useState(profile?.preferred_currency || "USD");
  const [travelStyle, setTravelStyle] = useState(
    TRAVEL_STYLES.find(t => t.value === (profile?.travel_style || "adventure")) || TRAVEL_STYLES[0]
  );
  const [interests, setInterests] = useState<readonly { label: string; value: string }[]>(
    (profile?.interests || []).map((v: string) => INTEREST_OPTIONS.find(o => o.value === v) || { label: v, value: v })
  );
  const [diet, setDiet] = useState(
    DIET_OPTIONS.find(d => d.value === (profile?.dietary_preferences?.[0] || "none")) || DIET_OPTIONS[0]
  );
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setHomeCountry(profile.home_country || "");
      setPreferredCurrency(profile.preferred_currency || "USD");
      setTravelStyle(TRAVEL_STYLES.find(t => t.value === profile.travel_style) || TRAVEL_STYLES[0]);
      setInterests((profile.interests || []).map((v: string) => INTEREST_OPTIONS.find(o => o.value === v) || { label: v, value: v }));
      setDiet(DIET_OPTIONS.find(d => d.value === (profile.dietary_preferences?.[0] || "none")) || DIET_OPTIONS[0]);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_trips").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setTripCount(count || 0));
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setFavCount(count || 0));
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName,
      bio,
      home_country: homeCountry,
      preferred_currency: preferredCurrency,
      travel_style: travelStyle.value,
      interests: interests.map(i => i.value),
      dietary_preferences: [diet.value],
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) {
      alert(error.message);
    } else {
      setSaveSuccess(true);
      await refreshProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <ContentLayout header={<Header variant="h1">My Profile</Header>}>
        <Container><Box textAlign="center" padding="xl">Loading profile...</Box></Container>
      </ContentLayout>
    );
  }

  if (!user) {
    return (
      <ContentLayout header={<Header variant="h1">My Profile</Header>}>
        <Container>
          <Box textAlign="center" padding="xl">
            <SpaceBetween size="m" alignItems="center">
              <Icon name="lock-private" size="large" />
              <Box variant="h3">Sign in to view your profile</Box>
              <Button variant="primary" onClick={() => navigate("/")}>Go Home</Button>
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
          description={user.email || ""}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => navigate("/saved-trips")}>My Trips</Button>
              <Button onClick={() => navigate("/favorites")}>Favorites</Button>
              <Button variant="primary" onClick={signOut} iconName="exit-full-screen">Sign Out</Button>
            </SpaceBetween>
          }
        >
          My Profile
        </Header>
      }
    >
      <SpaceBetween size="l">
        {saveSuccess && <Alert type="success" dismissible onDismiss={() => setSaveSuccess(false)}>Profile updated successfully!</Alert>}

        {/* Stats */}
        <Container>
          <ColumnLayout columns={3} borders="none">
            <Box textAlign="center">
              <Box variant="h1" fontSize="heading-xl" color="text-status-info">{tripCount}</Box>
              <Box color="text-body-secondary" fontSize="body-s">Saved Trips</Box>
            </Box>
            <Box textAlign="center">
              <Box variant="h1" fontSize="heading-xl" color="text-status-info">{favCount}</Box>
              <Box color="text-body-secondary" fontSize="body-s">Favorites</Box>
            </Box>
            <Box textAlign="center">
              <Box variant="h1" fontSize="heading-xl" color="text-status-info">{travelStyle.label}</Box>
              <Box color="text-body-secondary" fontSize="body-s">Travel Style</Box>
            </Box>
          </ColumnLayout>
        </Container>

        {/* Profile form */}
        <Container header={<Header variant="h2">Profile Information</Header>}>
          <SpaceBetween size="m">
            <Grid
              gridDefinition={[
                { colspan: { default: 12, s: 6 } },
                { colspan: { default: 12, s: 6 } },
              ]}
            >
              <FormField label="Display Name">
                <Input value={displayName} onChange={e => setDisplayName(e.detail.value)} placeholder="Your name" />
              </FormField>
              <FormField label="Home Country">
                <Input value={homeCountry} onChange={e => setHomeCountry(e.detail.value)} placeholder="e.g. United States" />
              </FormField>
            </Grid>

            <FormField label="Bio">
              <Textarea value={bio} onChange={e => setBio(e.detail.value)} placeholder="Tell us about your travel style..." rows={3} />
            </FormField>

            <Grid
              gridDefinition={[
                { colspan: { default: 12, s: 4 } },
                { colspan: { default: 12, s: 4 } },
                { colspan: { default: 12, s: 4 } },
              ]}
            >
              <FormField label="Preferred Currency">
                <Select
                  selectedOption={{ label: preferredCurrency, value: preferredCurrency }}
                  onChange={e => setPreferredCurrency(e.detail.selectedOption?.value || "USD")}
                  options={["USD", "EUR", "GBP", "JPY", "AUD", "IDR"].map(c => ({ label: c, value: c }))}
                />
              </FormField>
              <FormField label="Travel Style">
                <Select selectedOption={travelStyle} onChange={e => setTravelStyle(e.detail.selectedOption as typeof travelStyle)} options={TRAVEL_STYLES} />
              </FormField>
              <FormField label="Dietary Preferences">
                <Select selectedOption={diet} onChange={e => setDiet(e.detail.selectedOption as typeof diet)} options={DIET_OPTIONS} />
              </FormField>
            </Grid>

            <FormField label="Travel Interests">
              <Multiselect
                selectedOptions={interests as { label: string; value: string }[]}
                onChange={e => setInterests(e.detail.selectedOptions as { label: string; value: string }[])}
                options={INTEREST_OPTIONS}
                placeholder="Select your interests"
              />
            </FormField>

            <Box>
              <Button variant="primary" onClick={saveProfile} loading={saving} iconName="check">
                Save Profile
              </Button>
            </Box>
          </SpaceBetween>
        </Container>

        {/* Quick links */}
        <Container header={<Header variant="h2">Quick Links</Header>}>
          <Grid
            gridDefinition={[
              { colspan: { default: 6, s: 3 } },
              { colspan: { default: 6, s: 3 } },
              { colspan: { default: 6, s: 3 } },
              { colspan: { default: 6, s: 3 } },
            ]}
          >
            {[
              { label: "Saved Trips", icon: "ticket", count: tripCount, action: () => navigate("/saved-trips") },
              { label: "Favorites", icon: "heart-filled", count: favCount, action: () => navigate("/favorites") },
              { label: "Plan Trip", icon: "gen-ai", count: null, action: () => navigate("/itinerary") },
              { label: "Ask AI", icon: "suggestions-gen-ai", count: null, action: () => navigate("/chat") },
            ].map(item => (
              <Box key={item.label} textAlign="center" padding="m">
                <Button variant="normal" onClick={item.action} fullWidth>
                  <SpaceBetween size="s" alignItems="center">
                    <Icon name={item.icon as "ticket"} size="big" />
                    <Box>{item.label}</Box>
                    {item.count !== null && <Badge>{item.count}</Badge>}
                  </SpaceBetween>
                </Button>
              </Box>
            ))}
          </Grid>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
