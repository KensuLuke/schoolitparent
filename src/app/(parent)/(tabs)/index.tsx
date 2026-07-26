/**
 * app/(parent)/(tabs)/index.tsx — Children
 *
 * Lists every ParentStudentLink for this parent, VERIFIED or not — a
 * PENDING link shows "awaiting verification" and isn't tappable, since
 * requireVerifiedLink() on the server blocks all child* queries until an
 * admin verifies it (see parentResolvers.js). Includes a simple "link a
 * child" form (requestParentStudentLink) for onboarding a new child.
 */

import { useState } from "react";
import { FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from "react-native";
import { useMutation } from "urql";
import { toast } from "sonner-native";
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ClickableCard } from "@/components/ClickableCard";
import { Badge } from "@/components/Badge";
import { useThemeColor } from "@/hooks/useThemeColor";
import useChildren from "@/hooks/useChildren";
import { childDetail } from "@/constants/routes";
import { REQUEST_PARENT_STUDENT_LINK } from "@/graphql/gql";
import type { ParentStudentLink } from "@/storage/storage";

export default function ChildrenScreen() {
  const { background, mutedText, border, primary, cardBackground } = useThemeColor();
  const { children, fetching, error, refetch } = useChildren();

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [{ fetching: linking }, requestLink] = useMutation(REQUEST_PARENT_STUDENT_LINK);

  const handleRequestLink = async () => {
    if (!studentIdInput.trim()) {
      toast.error("Enter the student's ID.");
      return;
    }
    const { data, error: linkError } = await requestLink({
      studentId: studentIdInput.trim(),
      relationship: "GUARDIAN",
    });
    if (linkError || !data?.requestParentStudentLink) {
      toast.error(linkError?.graphQLErrors?.[0]?.message ?? "Couldn't send that request.");
      return;
    }
    toast.success("Request sent — your school will verify it shortly.");
    setStudentIdInput("");
    setShowLinkForm(false);
    refetch();
  };

  const renderItem = ({ item }: { item: ParentStudentLink }) => {
    const isVerified = item.status === "VERIFIED";
    return (
      <ClickableCard
        style={styles.card}
        onPress={() => {
          if (!isVerified) {
            toast.info(
              item.status === "PENDING"
                ? "This link is still awaiting verification by the school."
                : "This link was not approved by the school.",
            );
            return;
          }
          if (item.student) router.push(childDetail(item.student.id));
        }}
      >
        <ThemedView style={styles.cardRow}>
          <ThemedView style={[styles.avatar, { backgroundColor: primary + "20" }]}>
            <Ionicons name="person" size={22} color={primary} />
          </ThemedView>
          <ThemedView style={styles.cardInfo}>
            <ThemedText type="defaultSemiBold">
              {item.student ? `${item.student.firstName} ${item.student.lastName}` : "Unknown student"}
            </ThemedText>
            <ThemedText type="small" style={{ color: mutedText }}>
              {item.student?.studentId ?? ""}
              {item.student?.class?.name ? ` · ${item.student.class.name}` : ""}
            </ThemedText>
          </ThemedView>
          <Badge value={item.status} />
        </ThemedView>
      </ClickableCard>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ fontSize: 24 }}>
          My Children
        </ThemedText>
        <TouchableOpacity onPress={() => setShowLinkForm((v) => !v)} hitSlop={8}>
          <Ionicons name={showLinkForm ? "close" : "add-circle-outline"} size={28} color={primary} />
        </TouchableOpacity>
      </ThemedView>

      {showLinkForm && (
        <ThemedView style={[styles.linkForm, { backgroundColor: cardBackground, borderColor: border }]}>
          <ThemedText type="small" style={{ color: mutedText, marginBottom: 8 }}>
            Enter your child&apos;s Student ID (from the school) to request a link. The
            school must verify it before you can see their data.
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor: border, color: undefined }]}
            placeholder="Student ID"
            value={studentIdInput}
            onChangeText={setStudentIdInput}
            editable={!linking}
          />
          <TouchableOpacity
            style={[styles.linkBtn, { backgroundColor: primary }]}
            onPress={handleRequestLink}
            disabled={linking}
          >
            <ThemedText style={{ color: "#FFF", fontWeight: "700" }}>
              {linking ? "Sending…" : "Request Link"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {error && (
        <ThemedText type="small" style={{ color: mutedText, padding: 16 }}>
          Couldn&apos;t load your children. Pull to refresh.
        </ThemedText>
      )}

      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={fetching} onRefresh={refetch} />}
        ListEmptyComponent={
          !fetching ? (
            <ThemedView style={styles.empty}>
              <Ionicons name="people-outline" size={40} color={mutedText} />
              <ThemedText type="muted" style={{ marginTop: 8, textAlign: "center" }}>
                No children linked yet. Tap + to request a link.
              </ThemedText>
            </ThemedView>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  linkForm: { marginHorizontal: 20, marginBottom: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  linkBtn: { borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  cardInfo: { flex: 1, gap: 2 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 60, paddingHorizontal: 40 },
});
