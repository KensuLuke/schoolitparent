/**
 * app/(parent)/_layout.tsx
 *
 * Outer stack for the authenticated area — wraps the bottom-tabs group plus
 * the two detail screens (child/[studentId], report/[reportId]) that push
 * on top of the tabs, matching expo-router's Stack-wraps-Tabs pattern.
 */

import { Stack } from "expo-router";

export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="child/[studentId]" options={{ headerShown: true, title: "Child" }} />
      <Stack.Screen name="report/[reportId]" options={{ headerShown: true, title: "Report" }} />
      <Stack.Screen name="social/[postId]" options={{ headerShown: true, title: "Post" }} />
    </Stack>
  );
}
