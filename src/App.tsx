import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import { AppShell } from "./components/AppShell";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import ItineraryPage from "./pages/ItineraryPage";
import FoodPage from "./pages/FoodPage";
import HotelsPage from "./pages/HotelsPage";
import SavedTripsPage from "./pages/SavedTripsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/destination/:id" element={<DestinationDetailPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/saved-trips" element={<SavedTripsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
