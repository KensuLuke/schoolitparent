/**
 * app/(parent)/(tabs)/notifications.tsx
 *
 * Notification inbox — see server/graphQl/queries/notificationResolvers.js
 * for the read side and utils/notifications.js / utils/notificationRecipients.js
 * on the server for what actually triggers one (a child's weekly report
 * being ready, an absence, a new announcement, a verified parent-student
 * link — see helpers/notificationHelpers.js's resolveRecipient for how
 * "Parent" resolves).
 */
import { useState } from "react";
import { FlatList, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { useQuery, useMutation } from "urql";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Card from "@/components/Card";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/graphql/gql";
import type { AppNotification } from "@/storage/storage";
import { useNotificationsSubscription } from "@/hooks/useNotificationsSubscription";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function entityIcon(model?: string): string {
  switch (model) {
    case "WeeklyReport":
    case "MidTermReport":
    case "TerminalReport":
      return "document-text-outline";
    case "Attendance":
      return "calendar-outline";
    case "Announcement":
      return "megaphone-outline";
    case "ParentStudentLink":
      return "people-outline";
    default:
      return "notifications-outline";
  }
}

export default function NotificationsScreen() {
  const { background, mutedText, cardBackground, primary, error: errorColor } =
    useThemeColor();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const [{ data, fetching }, refetch] = useQuery({
    query: GET_NOTIFICATIONS,
    variables: {
      input: { isRead: filter === "unread" ? false : undefined, limit: 50 },
    },
    requestPolicy: "cache-and-network",
  });

  const [, markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [, markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const items: AppNotification[] = data?.notifications?.items ?? [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  const reload = () => refetch({ requestPolicy: "network-only" });

  // Instant delivery while the screen is open — a new notification lands
  // in the list without waiting for pull-to-refresh.
  useNotificationsSubscription(reload);

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ThemedView style={styles.headerRow}>
        <ThemedText type="title" style={styles.header}>
          Notifications
        </ThemedText>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={async () => {
              await markAllRead({});
              reload();
            }}
          >
            <ThemedText type="small" style={{ color: primary }}>
              Mark all read
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.filterRow}>
        {(["all", "unread"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && { backgroundColor: primary }]}
            onPress={() => setFilter(f)}
          >
            <ThemedText
              type="small"
              style={{ color: filter === f ? "#fff" : mutedText }}
            >
              {f === "all" ? "All" : `Unread (${unreadCount})`}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={fetching} onRefresh={reload} />}
        ListEmptyComponent={
          !fetching ? (
            <ThemedView style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={36} color={mutedText} />
              <ThemedText type="muted" style={{ marginTop: 8 }}>
                {filter === "unread" ? "No unread notifications" : "No notifications"}
              </ThemedText>
            </ThemedView>
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              { backgroundColor: cardBackground },
              !item.isRead && { borderColor: primary, borderWidth: 1 },
            ]}
          >
            <ThemedView style={styles.cardRow}>
              <Ionicons
                name={entityIcon(item.entity?.model) as any}
                size={20}
                color={item.type === "ALERT" ? errorColor : primary}
              />
              <ThemedView style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                {item.message && (
                  <ThemedText type="small" style={{ color: mutedText, marginTop: 2 }}>
                    {item.message}
                  </ThemedText>
                )}
                <ThemedText type="small" style={{ color: mutedText, marginTop: 6 }}>
                  {timeAgo(item.createdAt)}
                </ThemedText>
              </ThemedView>
              {!item.isRead && (
                <TouchableOpacity
                  onPress={async () => {
                    await markRead({ id: item.id });
                    reload();
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={primary} />
                </TouchableOpacity>
              )}
            </ThemedView>
          </Card>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: { fontSize: 24 },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 10 },
  cardRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  card: { marginBottom: 0 },
  empty: { alignItems: "center", paddingTop: 60 },
});
