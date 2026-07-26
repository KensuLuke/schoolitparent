/**
 * components/social/SocialPostCard.tsx
 *
 * Feed card for a single FeedEntry — an INTERNAL_EVENT from the child's
 * school calendar, or a SOCIAL_POST (own-school or public cross-school).
 */
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/Badge";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { FeedEntry } from "@/storage/storage";

const TYPE_LABELS: Record<string, string> = {
  SPORTS_DAY: "Sports Day",
  GRADUATION: "Graduation",
  QUIZ_COMPETITION: "Quiz Competition",
  MILESTONE: "Milestone",
  CULTURAL: "Cultural",
  ACADEMIC_COMPETITION: "Academic Competition",
  OTHER: "Event",
};

export function SocialPostCard({ entry, onPress }: { entry: FeedEntry; onPress: () => void }) {
  const { mutedText, border, cardBackground, primary } = useThemeColor();

  if (entry.kind === "INTERNAL_EVENT" && entry.event) {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBackground, borderColor: border }]}
        onPress={onPress}
      >
        <ThemedView style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color={primary} />
          <ThemedText type="defaultSemiBold" style={{ flex: 1, marginLeft: 8 }}>
            {entry.event.title}
          </ThemedText>
          <Badge value="Your school" type="info" />
        </ThemedView>
      </TouchableOpacity>
    );
  }

  const post = entry.post;
  if (!post) return null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBackground, borderColor: border }]}
      onPress={onPress}
    >
      {post.coverImage && <Image source={{ uri: post.coverImage }} style={styles.cover} />}
      <ThemedView style={styles.body}>
        <ThemedView style={styles.row}>
          <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>
            {post.title}
          </ThemedText>
          {post.isBoosted && <Badge value="Boosted" type="alert" />}
        </ThemedView>
        <ThemedText type="small" style={{ color: mutedText, marginTop: 2 }}>
          {post.school?.name ?? "SchoolIt Social"} ·{" "}
          {TYPE_LABELS[post.type] ?? post.customTypeLabel ?? "Event"} · {post.status}
        </ThemedText>
        <ThemedView style={[styles.row, { marginTop: 6 }]}>
          <Ionicons
            name={post.viewerHasReacted ? "heart" : "heart-outline"}
            size={16}
            color={post.viewerHasReacted ? "#e0245e" : mutedText}
          />
          <ThemedText type="small" style={{ color: mutedText, marginLeft: 4 }}>
            {post.reactionCount}
          </ThemedText>
          {post.voteSessions.length > 0 && (
            <ThemedView style={[styles.row, { marginLeft: 12 }]}>
              <Ionicons name="podium-outline" size={16} color={mutedText} />
              <ThemedText type="small" style={{ color: mutedText, marginLeft: 4 }}>
                Live vote
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  cover: { width: "100%", height: 150 },
  body: { padding: 12 },
  row: { flexDirection: "row", alignItems: "center" },
});
