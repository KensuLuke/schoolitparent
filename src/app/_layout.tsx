/**
 * app/_layout.tsx
 *
 * Root layout — mirrors mobile/admin's pattern (urql Provider, hydrated
 * AsyncStorage-backed session, auth-based redirect guard) minus the
 * geofencing/font-loading pieces staff mobile needs and this app doesn't.
 */

import { useEffect, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Provider as UrqlProvider } from "urql";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, DarkTheme, DefaultTheme } from "expo-router/react-navigation";
import { Toaster } from "sonner-native";

import { hydrateStorage } from "@/storage/storage";
import { useAuthStore, useAppStore } from "@/stores/stores";
import { routes, getHomeRoute } from "@/constants/routes";
import { getClient } from "@/graphql/client";
import { usePushRegistration } from "@/hooks/usePushRegistration";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const hasNavigated = useRef(false);

  const { isAuthenticated, isInitializing, initialize } = useAuthStore();
  const { theme, initialize: initApp } = useAppStore();

  usePushRegistration();

  useEffect(() => {
    hydrateStorage().then(() => {
      initialize();
      initApp();
    });
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitializing]);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === routes.segments.auth;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace(routes.login);
      return;
    }

    if (hasNavigated.current) return;
    if (isAuthenticated && inAuthGroup) {
      hasNavigated.current = true;
      router.replace(getHomeRoute());
    }
  }, [isAuthenticated, isInitializing, segments]);

  if (isInitializing) return null;

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name={routes.authGroup} />
        <Stack.Screen name={routes.parentGroup} />
        <Stack.Screen name={routes.notFound} />
      </Stack>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Toaster />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <UrqlProvider value={getClient()}>
      <RootLayoutNav />
    </UrqlProvider>
  );
}

export { ErrorBoundary } from "@/components/AppErrorBoundary";
