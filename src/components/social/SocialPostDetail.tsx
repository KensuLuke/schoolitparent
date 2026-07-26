/**
 * components/social/SocialPostDetail.tsx
 *
 * Post-detail screen — Overview, live photo/status timeline, and a vote
 * ballot if the post has a linked VoteSession. Subscribes to
 * socialPostUpdated for live updates — already wired server-side
 * (server/utils/socialPostNotifications.js).
 */
import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useQuery, useMutation, useSubscription } from "urql";
import Ionicons from "@react-native-vector-icons/ionicons";
import { toast } from "sonner-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import { Separator } from "@/components/Separator";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/stores/stores";
import { SOCIAL_POST, SOCIAL_POST_UPDATED, REACT_TO_SOCIAL_POST, CAST_SOCIAL_VOTE } from "@/graphql/gql";
import type { SocialPost } from "@/storage/storage";

function nomineeLabel(nominee: unknown): string {
  if (nominee && typeof nominee === "object") {
    const n = nominee as any;
    const doc = n.id && typeof n.id === "object" ? n.id : n;
    const name = doc?.name ?? (doc?.firstName ? `${doc.firstName ?? ""} ${doc.lastName ?? ""}`.trim() : null);
    return name || doc?.title || n.model || "Nominee";
  }
  return "Nominee";
}

export function SocialPostDetail({ postId }: { postId: string }) {
  const { primary, mutedText, border, cardBackground } = useThemeColor();
  const parentId = useAuthStore((s) => s.parentId);

  const [{ data, fetching }, refetch] = useQuery<{ socialPost: SocialPost | null }>({
    query: SOCIAL_POST,
    variables: { id: postId },
    requestPolicy: "cache-and-network",
  });

  useSubscription({ query: SOCIAL_POST_UPDATED, variables: { postId } }, (_prev, d) => {
    refetch({ requestPolicy: "network-only" });
    return d;
  });

  const [, react] = useMutation(REACT_TO_SOCIAL_POST);
  const [, castVote] = useMutation(CAST_SOCIAL_VOTE);
  const [votingId, setVotingId] = useState<string | null>(null);

  const post = data?.socialPost;

  if (fetching && !post) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={primary} />
      </ThemedView>
    );
  }
  if (!post) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="muted">Post not found.</ThemedText>
      </ThemedView>
    );
  }

  const handleReact = async () => {
    const { error } = await react({ input: { postId: post.id, reactionType: "LIKE" } });
    if (error) toast.error("Failed to react");
  };

  const handleVote = async (voteSessionId: string, nomineeRef: unknown) => {
    if (!parentId) return;
    setVotingId(voteSessionId);
    const { error } = await castVote({
      input: {
        voteSessionId,
        nominee: nomineeRef,
        voter: { id: parentId, model: "Parent" },
      },
    });
    setVotingId(null);
    if (error) {
      toast.error(error.graphQLErrors?.[0]?.message ?? "Failed to cast vote");
      return;
    }
    toast.success("Vote cast!");
    refetch({ requestPolicy: "network-only" });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      {post.coverImage && <Image source={{ uri: post.coverImage }} style={styles.cover} />}

      <ThemedView style={styles.body}>
        <ThemedView style={styles.row}>
          <ThemedText type="title" style={{ flex: 1 }}>
            {post.title}
          </ThemedText>
          {post.isBoosted && <Badge value="Boosted" type="alert" />}
        </ThemedView>
        <ThemedText type="small" style={{ color: mutedText, marginTop: 2 }}>
          {post.school?.name} · {post.status}
          {post.location ? ` · ${post.location}` : ""}
        </ThemedText>

        <ThemedText style={{ marginTop: 12 }}>{post.description}</ThemedText>

        <TouchableOpacity style={styles.reactBtn} onPress={handleReact}>
          <Ionicons
            name={post.viewerHasReacted ? "heart" : "heart-outline"}
            size={22}
            color={post.viewerHasReacted ? "#e0245e" : mutedText}
          />
          <ThemedText style={{ marginLeft: 6, color: mutedText }}>
            {post.reactionCount} {post.reactionCount === 1 ? "reaction" : "reactions"}
          </ThemedText>
        </TouchableOpacity>

        {post.updates.length > 0 && (
          <>
            <Separator />
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              Live Updates
            </ThemedText>
            {[...post.updates].reverse().map((u) => (
              <ThemedView key={u.id} style={[styles.updateCard, { borderColor: border, backgroundColor: cardBackground }]}>
                <Image source={{ uri: u.media }} style={styles.updateImage} />
                {u.caption && <ThemedText style={{ marginTop: 6 }}>{u.caption}</ThemedText>}
                <ThemedText type="small" style={{ color: mutedText, marginTop: 4 }}>
                  {new Date(u.postedAt).toLocaleString()}
                </ThemedText>
              </ThemedView>
            ))}
          </>
        )}

        {post.voteSessions.length > 0 && (
          <>
            <Separator />
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              Live Vote
            </ThemedText>
            {post.voteSessions.map((vs) => {
              const total = vs.nominees.reduce((s, n) => s + (n.voteCount ?? 0), 0) || 1;
              return (
                <ThemedView key={vs.id} style={[styles.voteCard, { borderColor: border }]}>
                  <ThemedView style={styles.row}>
                    <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>
                      {vs.title || "Vote"}
                    </ThemedText>
                    <Badge value={vs.status} type={vs.status === "PENDING" ? "info" : "default"} />
                  </ThemedView>
                  {vs.nominees
                    .filter((n) => !n.isDisqualified)
                    .map((n) => (
                      <ThemedView key={n.id} style={{ marginTop: 10 }}>
                        <ThemedView style={styles.row}>
                          <ThemedText type="small" style={{ flex: 1 }}>
                            {nomineeLabel(n.nominee)}
                          </ThemedText>
                          <ThemedText type="small" style={{ color: mutedText }}>
                            {n.voteCount}
                          </ThemedText>
                        </ThemedView>
                        <ProgressBar value={(n.voteCount / total) * 100} />
                        {vs.status === "PENDING" && (
                          <TouchableOpacity
                            style={[styles.voteBtn, { borderColor: primary }]}
                            onPress={() => handleVote(vs.id, n.nominee)}
                            disabled={votingId === vs.id}
                          >
                            <ThemedText type="small" style={{ color: primary }}>
                              {votingId === vs.id ? "Voting…" : "Vote"}
                            </ThemedText>
                          </TouchableOpacity>
                        )}
                      </ThemedView>
                    ))}
                </ThemedView>
              );
            })}
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cover: { width: "100%", height: 220 },
  body: { padding: 16 },
  row: { flexDirection: "row", alignItems: "center" },
  reactBtn: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  updateCard: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
  updateImage: { width: "100%", height: 160, borderRadius: 8 },
  voteCard: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  voteBtn: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
});
