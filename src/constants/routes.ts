/**
 * constants/routes.ts
 *
 * Navigation architecture (simpler than staff mobile — parents have no
 * role split, so just Tabs, no Drawer):
 *   Root Stack
 *   ├── (auth)     Stack — login
 *   └── (parent)   Tabs  — index (children), reports, announcements, profile
 *       ├── child/[studentId]      — one child's detail (attendance/grades)
 *       └── report/[reportId]      — one report's detail + acknowledge form
 */

import type { Href } from "expo-router";

export const routes = {
  authGroup: "(auth)",
  parentGroup: "(parent)",
  notFound: "+not-found",

  segments: {
    auth: "(auth)",
    parent: "(parent)",
  },

  login: "/(auth)/login" as Href,

  parentHome: "/(parent)/(tabs)" as Href,
  parentReports: "/(parent)/(tabs)/reports" as Href,
  parentAnnouncements: "/(parent)/(tabs)/announcements" as Href,
  parentNotifications: "/(parent)/(tabs)/notifications" as Href,
  parentProfile: "/(parent)/(tabs)/profile" as Href,
} as const;

export function childDetail(studentId: string): Href {
  return `/(parent)/child/${studentId}` as Href;
}

export function reportDetail(reportId: string, reportType: string): Href {
  return `/(parent)/report/${reportId}?reportType=${reportType}` as Href;
}

/** Home route for any authenticated parent — no role branching needed. */
export function getHomeRoute(): Href {
  return routes.parentHome;
}
