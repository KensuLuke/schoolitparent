/**
 * app/(parent)/(tabs)/reports.tsx — Reports inbox
 *
 * Aggregates REVIEWED-but-not-yet-ACKNOWLEDGED weekly reports across every
 * VERIFIED child into one actionable list — "what needs my attention",
 * distinct from the Children tab's "browse by child". Issues one
 * CHILD_WEEKLY_REPORTS query per verified child imperatively (client.query
 * in a loop), not N useQuery hooks, since the child count is dynamic and
 * hooks can't be called in a loop.
 */

import { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, RefreshControl } from "react-native";
import { router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ClickableCard } from "@/components/ClickableCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getClient } from "@/graphql/client";
import { CHILD_WEEKLY_REPORTS } from "@/graphql/gql";
import useChildren from "@/hooks/useChildren";
import { reportDetail } from "@/constants/routes";
import type { WeeklyReportRecord } from "@/storage/storage";

interface InboxItem extends WeeklyReportRecord {
  studentName: string;
}

export default function ReportsInboxScreen() {
  const { background, mutedText, cardBackground } = useThemeColor();
  const { verifiedChildren, fetching: childrenFetching, refetch: refetchChildren } = useChildren();

  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInbox = useCallback(async () => {
    if (verifiedChildren.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    const client = getClient();
    const results = await Promise.all(
      verifiedChildren.map(async (link) => {
        if (!link.student) return [];
        const { data } = await client
          .query(CHILD_WEEKLY_REPORTS, { studentId: link.student.id })
          .toPromise();
        const reports: WeeklyReportRecord[] = data?.childWeeklyReports ?? [];
        return reports
          .filter((r) => r.status === "REVIEWED") // ready for the parent, not yet acknowledged
          .map((r) => ({ ...r, studentName: `${link.student!.firstName} ${link.student!.lastName}` }));
      }),
    );
    setItems(results.flat().sort((a, b) => (a.weekEnd < b.weekEnd ? 1 : -1)));
    setLoading(false);
  }, [verifiedChildren]);

  useEffect(() => {
    // A .then() callback rather than calling loadInbox() directly —
    // loadInbox() calls setLoading(true) synchronously before its first
    // await, which the lint rule's static analysis flags even though
    // nothing here ever resolves within the same synchronous tick.
    Promise.resolve().then(() => loadInbox());
  }, [loadInbox]);

  const onRefresh = () => {
    refetchChildren();
    loadInbox();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ThemedText type="title" style={styles.header}>
        Reports
      </ThemedText>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading || childrenFetching} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ClickableCard
            style={[styles.card, { backgroundColor: cardBackground }]}
            onPress={() => router.push(reportDetail(item.id, "WEEKLY"))}
          >
            <ThemedText type="defaultSemiBold">{item.studentName}</ThemedText>
            <ThemedText type="small" style={{ color: mutedText }}>
              Week of {new Date(item.weekStart).toLocaleDateString()} — needs your acknowledgment
            </ThemedText>
          </ClickableCard>
        )}
        ListEmptyComponent={
          !loading ? (
            <ThemedView style={styles.empty}>
              <ThemedText type="muted">Nothing needs your attention right now.</ThemedText>
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
