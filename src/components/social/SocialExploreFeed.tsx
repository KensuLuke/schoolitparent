/**
 * components/social/SocialExploreFeed.tsx
 *
 * The Explore tab's real content — a "SchoolIt Social" feed with "For You"
 * and "Recommended" tabs. Tiering is computed server-side (socialPostQuery.js)
 * — this screen renders items in the order the server returns them.
 * Browse/react/vote only — this app never authors posts.
 *
 * Scope note: uses the parent's stored `schoolId` (set at login) as the
 * "own school" for tiering. A parent with children at MULTIPLE schools only
 * gets one school's imminent-events/own-posts prioritized this way — full
 * per-child-school fan-out (like announcements.tsx does for
 * CHILD_ANNOUNCEMENTS) is a reasonable follow-up, not attempted here.
 */
import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useQuery } from "urql";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/stores/stores";
import { SOCIAL_POST_FEED } from "@/graphql/gql";
import type { FeedTab, SocialPostFeedResult } from "@/storage/storage";
import { SocialPostCard } from "@/components/social/SocialPostCard";

export default function SocialExploreFeed() {
  const { primary, mutedText, border, background } = useThemeColor();
  const schoolId = useAuthStore((s) => s.schoolId);
  const [tab, setTab] = useState<FeedTab>("FOR_YOU");

  const [{ data, fetching }, refetch] = useQuery<{ socialPostFeed: SocialPostFeedResult }>({
    query: SOCIAL_POST_FEED,
    variables: { input: { school: schoolId ?? "", tab, page: 1, limit: 20 } },
    pause: !schoolId,
    requestPolicy: "cache-and-network",
  });

  const items = data?.socialPostFeed.items ?? [];

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ThemedText type="title" style={styles.header}>
        Explore
      </ThemedText>

      <ThemedView style={[styles.tabRow, { borderColor: border }]}>
        {(["FOR_YOU", "RECOMMENDED"] as FeedTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderColor: primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
          >
            <ThemedText
              style={{ color: tab === t ? primary : mutedText, fontWeight: tab === t ? "700" : "400" }}
            >
              {t === "FOR_YOU" ? "For You" : "Recommended"}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <FlatList
        data={items}
        keyExtractor={(entry, i) => `${entry.kind}-${entry.event?.id ?? entry.post?.id ?? i}`}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={fetching} onRefresh={() => refetch({ requestPolicy: "network-only" })} />
        }
        ListEmptyComponent={
          fetching ? (
            <ThemedView style={styles.center}>
              <ActivityIndicator size="large" color={primary} />
            </ThemedView>
          ) : (
            <ThemedView style={styles.center}>
              <Ionicons name="images-outline" size={40} color={mutedText} />
              <ThemedText type="muted" style={{ marginTop: 8 }}>
                {tab === "FOR_YOU" ? "Nothing new yet." : "No public posts from other schools yet."}
              </ThemedText>
            </ThemedView>
          )
        }
        renderItem={({ item }) => (
          <SocialPostCard
            entry={item}
            onPress={() => {
              if (item.kind === "SOCIAL_POST" && item.post) {
                router.push(`/(parent)/social/${item.post.id}` as any);
              }
            }}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { fontSize: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  tabRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12 },
  tab: { paddingVertical: 12, paddingHorizontal: 16 },
  list: { padding: 16 },
  center: { paddingVertical: 60, alignItems: "center" },
});
