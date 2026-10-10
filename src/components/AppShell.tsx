import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "@cloudscape-design/components/app-layout";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Form from "@cloudscape-design/components/form";
import Alert from "@cloudscape-design/components/alert";
import Flashbar from "@cloudscape-design/components/flashbar";
import type { FlashbarProps } from "@cloudscape-design/components/flashbar";
import type { TopNavigationProps } from "@cloudscape-design/components/top-navigation";
import { useAuth } from "../lib/auth-context";

type AppShellProps = {
  children: React.ReactNode;
  notifications?: FlashbarProps.MessageDefinition[];
};

export function AppShell({ children, notifications = [] }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const { signIn, signUp } = useAuth();

  const navItems = [
    {
      type: "link" as const,
      text: "Home",
      href: "/",
      info: undefined,
    },
    {
      type: "link" as const,
      text: "Explore Destinations",
      href: "/explore",
    },
    {
      type: "link" as const,
      text: "Interactive Map",
      href: "/map",
    },
    { type: "divider" as const },
    {
      type: "link" as const,
      text: "AI Travel Assistant",
      href: "/chat",
    },
    {
      type: "link" as const,
      text: "Trip Planner",
      href: "/itinerary",
    },
    { type: "divider" as const },
    {
      type: "link" as const,
      text: "Food & Restaurants",
      href: "/food",
    },
    {
      type: "link" as const,
      text: "Hotels & Stays",
      href: "/hotels",
    },
    { type: "divider" as const },
    {
      type: "link" as const,
      text: "Saved Trips",
      href: "/saved-trips",
    },
    {
      type: "link" as const,
      text: "Favorites",
      href: "/favorites",
    },
    {
      type: "link" as const,
      text: "My Profile",
      href: "/profile",
    },
  ];

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authMode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
      }
      setAuthModalOpen(false);
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (err: unknown) {
      setAuthError((err as Error).message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }

  const utilities = user
    ? [
        {
          type: "menu-dropdown" as const,
          text: profile?.display_name || user.email || "Account",
          iconName: "user-profile" as const,
          items: [
            { id: "profile", text: "My Profile", href: "/profile" },
            { id: "saved", text: "Saved Trips", href: "/saved-trips" },
            { id: "favorites", text: "Favorites", href: "/favorites" },
            { id: "divider", text: "-" },
            { id: "signout", text: "Sign Out" },
          ],
          onItemClick: ({ detail }: { detail: { id: string; href?: string } }) => {
            if (detail.id === "signout") {
              signOut();
            } else if (detail.href) {
              navigate(detail.href);
            }
          },
        },
      ]
    : [
        {
          type: "button" as const,
          text: "Sign In",
          onClick: () => {
            setAuthMode("signin");
            setAuthModalOpen(true);
          },
        },
        {
          type: "button" as const,
          text: "Sign Up",
          variant: "primary" as const,
          onClick: () => {
            setAuthMode("signup");
            setAuthModalOpen(true);
          },
        },
      ];

  return (
    <>
      <div id="h" style={{ position: "sticky", top: 0, zIndex: 1000 }}>
        <TopNavigation
          identity={{
            href: "/",
            title: "Wanderly AI",
            onFollow: (e) => {
              e.preventDefault();
              navigate("/");
            },
          }}
          utilities={utilities as unknown as React.ComponentProps<typeof TopNavigation>["utilities"]}
          i18nStrings={{
            overflowMenuTriggerText: "More",
            overflowMenuTitleText: "All",
          }}
        />
      </div>
      <AppLayout
        headerSelector="#h"
        navigationOpen={navOpen}
        onNavigationChange={({ detail }) => setNavOpen(detail.open)}
        navigation={
          <SideNavigation
            activeHref={location.pathname}
            header={{ text: "Wanderly", href: "/" }}
            onFollow={(e) => {
              e.preventDefault();
              navigate(e.detail.href);
            }}
            items={navItems}
          />
        }
        notifications={notifications.length > 0 ? <Flashbar items={notifications} /> : undefined}
        toolsHide
        content={children}
      />

      {authModalOpen && <Modal
        visible={authModalOpen}
        onDismiss={() => setAuthModalOpen(false)}
        header={authMode === "signin" ? "Sign In to Wanderly" : "Create Your Account"}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setAuthModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                loading={authLoading}
                onClick={() => handleAuth(new Event("submit") as unknown as React.FormEvent)}
              >
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <form onSubmit={handleAuth}>
          <Form>
            <SpaceBetween size="m">
              {authError && <Alert key="auth-error" type="error">{authError}</Alert>}
              {authMode === "signup" && (
                <FormField key="display-name" label="Display Name">
                  <Input
                    value={displayName}
                    onChange={e => setDisplayName(e.detail.value)}
                    placeholder="Your name"
                    autoFocus
                  />
                </FormField>
              )}
              <FormField key="email" label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.detail.value)}
                  placeholder="you@example.com"
                  autoFocus={authMode === "signin"}
                />
              </FormField>
              <FormField key="password" label="Password">
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.detail.value)}
                  placeholder="••••••••"
                />
              </FormField>
              <Box key="auth-switch" textAlign="center">
                <Button
                  variant="link"
                  onClick={() => {
                    setAuthMode(authMode === "signin" ? "signup" : "signin");
                    setAuthError("");
                  }}
                >
                  {authMode === "signin"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Button>
              </Box>
            </SpaceBetween>
          </Form>
        </form>
      </Modal>}
    </>
  );
}
