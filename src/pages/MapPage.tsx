import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import Tabs from "@cloudscape-design/components/tabs";
import Spinner from "@cloudscape-design/components/spinner";
import Badge from "@cloudscape-design/components/badge";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Icon from "@cloudscape-design/components/icon";
import { DESTINATIONS, PLACES, type Place } from "../data/destinations";
import { PlaceCard } from "../components/PlaceCard";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in webpack/vite
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_FILTER = [
  { label: "All Places", value: "" },
  { label: "Attractions", value: "attraction" },
  { label: "Restaurants", value: "restaurant" },
  { label: "Cafes", value: "cafe" },
  { label: "Hotels", value: "hotel" },
  { label: "Museums", value: "museum" },
];

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [citySearch, setCitySearch] = useState(searchParams.get("city") || "Paris");
  const [categoryFilter, setCategoryFilter] = useState(CATEGORY_FILTER[0]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const initialLat = parseFloat(searchParams.get("lat") || "48.8566");
  const initialLng = parseFloat(searchParams.get("lng") || "2.3522");

  const visiblePlaces = PLACES.filter(p => {
    const matchCity = citySearch ? p.city.toLowerCase().includes(citySearch.toLowerCase()) : true;
    const matchCat = categoryFilter.value ? p.type === categoryFilter.value : true;
    return matchCity && matchCat;
  });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;
    setMapLoaded(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    visiblePlaces.forEach(place => {
      const icon = L.divIcon({
        html: `<div style="
          background: ${place.type === "restaurant" || place.type === "cafe" ? "#16a34a" :
                       place.type === "hotel" ? "#2563eb" :
                       place.type === "museum" ? "#7c3aed" : "#dc2626"};
          color: white; border-radius: 50%; width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${place.type === "restaurant" || place.type === "cafe" ? "🍽" :
            place.type === "hotel" ? "🏨" :
            place.type === "museum" ? "🏛" : "📍"}
        </div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 180px;">
            <strong>${place.name}</strong><br>
            <span style="color: #666; font-size: 12px;">${place.category}</span><br>
            <span style="font-size: 12px;">⭐ ${place.rating} · ${place.city}</span><br>
            <span style="font-size: 11px;">${place.openHours}</span>
          </div>
        `)
        .on("click", () => setSelectedPlace(place));

      markersRef.current.push(marker);
    });
  }, [visiblePlaces, mapLoaded]);

  function searchCity() {
    const dest = DESTINATIONS.find(d => d.name.toLowerCase() === citySearch.toLowerCase() || d.country.toLowerCase() === citySearch.toLowerCase());
    if (dest && mapRef.current) {
      mapRef.current.flyTo([dest.lat, dest.lng], 13, { animate: true, duration: 1.5 });
    }
  }

  function flyToPlace(place: Place) {
    if (mapRef.current) {
      mapRef.current.flyTo([place.lat, place.lng], 16, { animate: true, duration: 1 });
      setSelectedPlace(place);
    }
  }

  const tabPlaces = (tab: string) => {
    if (tab === "all") return visiblePlaces;
    if (tab === "food") return visiblePlaces.filter(p => ["restaurant", "cafe"].includes(p.type));
    if (tab === "stays") return visiblePlaces.filter(p => p.type === "hotel");
    return visiblePlaces.filter(p => ["attraction", "museum", "park"].includes(p.type));
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Explore places interactively on the map"
        >
          Interactive Map
        </Header>
      }
    >
      <div style={{ display: "flex", gap: 16, height: "calc(100vh - 220px)", minHeight: 600 }}>
        {/* Sidebar */}
        <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          <Container>
            <SpaceBetween size="s">
              <SpaceBetween direction="horizontal" size="xs">
                <div style={{ flex: 1 }}>
                  <Input
                    value={citySearch}
                    onChange={e => setCitySearch(e.detail.value)}
                    onKeyDown={e => e.detail.key === "Enter" && searchCity()}
                    placeholder="Search city or destination..."
                  />
                </div>
                <Button onClick={searchCity} iconName="search" />
              </SpaceBetween>
              <Select
                selectedOption={categoryFilter}
                onChange={e => setCategoryFilter(e.detail.selectedOption as typeof categoryFilter)}
                options={CATEGORY_FILTER}
              />
            </SpaceBetween>
          </Container>

          {selectedPlace && (
            <Container
              header={
                <Header
                  variant="h3"
                  actions={<Button variant="icon" iconName="close" onClick={() => setSelectedPlace(null)} />}
                >
                  Selected Place
                </Header>
              }
            >
              <PlaceCard place={selectedPlace} />
            </Container>
          )}

          <div style={{ flex: 1, overflowY: "auto" }}>
            <Tabs
              activeTabId={activeTab}
              onChange={e => setActiveTab(e.detail.activeTabId)}
              tabs={[
                { id: "all", label: `All (${tabPlaces("all").length})` },
                { id: "food", label: `Food (${tabPlaces("food").length})` },
                { id: "stays", label: `Stays (${tabPlaces("stays").length})` },
                { id: "sights", label: `Sights (${tabPlaces("sights").length})` },
              ]}
            />
            <SpaceBetween size="xs">
              {tabPlaces(activeTab).length === 0 ? (
                <Box padding="m" textAlign="center" color="text-body-secondary">
                  No places found for this city. Try Paris, Tokyo, or Bali.
                </Box>
              ) : (
                tabPlaces(activeTab).map(place => (
                  <div
                    key={place.id}
                    style={{
                      cursor: "pointer",
                      background: selectedPlace?.id === place.id ? "var(--color-background-item-selected)" : undefined,
                      borderRadius: 8,
                      padding: 4,
                    }}
                    onClick={() => flyToPlace(place)}
                  >
                    <PlaceCard place={place} compact />
                  </div>
                ))
              )}
            </SpaceBetween>
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", position: "relative" }}>
          {!mapLoaded && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "#f0f4f8", zIndex: 1,
            }}>
              <Spinner size="large" />
            </div>
          )}
          <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

          {/* Legend */}
          <div style={{
            position: "absolute", bottom: 16, right: 16, zIndex: 1000,
            background: "white", borderRadius: 8, padding: "8px 12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontSize: 12,
          }}>
            <SpaceBetween size="xxs">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "#dc2626" }}>📍</span> Attraction
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span>🍽</span> Restaurant/Cafe
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span>🏨</span> Hotel
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span>🏛</span> Museum
              </div>
            </SpaceBetween>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
