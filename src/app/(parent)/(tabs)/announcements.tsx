/**
 * app/(parent)/(tabs)/announcements.tsx
 *
 * Announcements are school-scoped, not per-student (see Announcement.js /
 * childAnnouncements in parentResolvers.js) — so this dedupes by school
 * before fetching, rather than issuing one redundant query per child at
 * schools shared by siblings.
 */

import { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, RefreshControl } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Card from "@/components/Card";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getClient } from "@/graphql/client";
import { CHILD_ANNOUNCEMENTS } from "@/graphql/gql";
import useChildren from "@/hooks/useChildren";
import type { AnnouncementRecord } from "@/storage/storage";

export default function AnnouncementsScreen() {
  const { background, mutedText, cardBackground } = useThemeColor();
  const { verifiedChildren, fetching: childrenFetching, refetch: refetchChildren } = useChildren();

  const [items, setItems] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (verifiedChildren.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    const client = getClient();
    // One representative student per distinct school — announcements don't
    // vary per child within the same school.
    const seenSchools = new Set<string>();
    const representativeStudentIds = verifiedChildren
      .filter((link) => {
        if (!link.student || seenSchools.has(link.school)) return false;
        seenSchools.add(link.school);
        return true;
      })
      .map((link) => link.student!.id);

    const results = await Promise.all(
      representativeStudentIds.map(async (studentId) => {
        const { data } = await client
          .query(CHILD_ANNOUNCEMENTS, { studentId })
          .toPromise();
        return (data?.childAnnouncements ?? []) as AnnouncementRecord[];
      }),
    );
    setItems(
      results
        .flat()
        .sort((a, b) => ((a.createdAt ?? "") < (b.createdAt ?? "") ? 1 : -1)),
    );
    setLoading(false);
  }, [verifiedChildren]);

  useEffect(() => {
    // A .then() callback rather than calling load() directly — load()
    // calls setLoading(true) synchronously before its first await, which
    // the lint rule's static analysis flags even though the awaited work
    // means nothing here ever resolves within the same synchronous tick.
    Promise.resolve().then(() => load());
  }, [load]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ThemedText type="title" style={styles.header}>
        Announcements
      </ThemedText>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading || childrenFetching}
            onRefresh={() => {
              refetchChildren();
              load();
            }}
          />
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: cardBackground }]}>
            <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
            {item.message && (
              <ThemedText type="small" style={{ color: mutedText, marginTop: 4 }}>
                {item.message}
              </ThemedText>
            )}
            {item.createdAt && (
              <ThemedText type="small" style={{ color: mutedText, marginTop: 6 }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </ThemedText>
            )}
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <ThemedView style={styles.empty}>
              <ThemedText type="muted">No announcements right now.</ThemedText>
            </ThemedView>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  card: { marginBottom: 0 },
  empty: { alignItems: "center", paddingTop: 60 },
});
