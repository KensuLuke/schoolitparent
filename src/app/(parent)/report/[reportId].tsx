/**
 * app/(parent)/report/[reportId].tsx
 *
 * Acknowledge form — feedback text + 1-5 rating, submits acknowledgeReport.
 * One-shot server-side (see parentResolvers.js): if this report was already
 * acknowledged, the mutation returns a clear "already been acknowledged"
 * error rather than silently succeeding or overwriting prior feedback —
 * this screen surfaces that error as-is rather than hiding it.
 *
 * No separate "fetch report by id" query exists (only per-student list
 * queries — see parentTypedefs.js) — this screen doesn't need one since it
 * only ever writes, it never needs to redisplay the report's own content.
 */

import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useMutation } from "urql";
import { toast } from "sonner-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ACKNOWLEDGE_REPORT } from "@/graphql/gql";
import type { ReportType } from "@/storage/storage";

export default function ReportAcknowledgeScreen() {
  const { reportId, reportType } = useLocalSearchParams<{ reportId: string; reportType: ReportType }>();
  const { background, border, mutedText, primary, cardBackground } = useThemeColor();

  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [{ fetching }, acknowledgeReport] = useMutation(ACKNOWLEDGE_REPORT);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    const { data, error } = await acknowledgeReport({
      reportId,
      reportType,
      feedbackText: feedbackText.trim() || undefined,
      rating: rating ?? undefined,
    });

    if (error || !data?.acknowledgeReport) {
      toast.error(error?.graphQLErrors?.[0]?.message ?? "Couldn't acknowledge this report.");
      return;
    }

    setDone(true);
    toast.success("Report acknowledged.");
  };

  if (done) {
    return (
      <ThemedView style={[styles.container, styles.center, { backgroundColor: background }]}>
        <Ionicons name="checkmark-circle" size={64} color={primary} />
        <ThemedText type="subtitle" style={{ marginTop: 16 }}>Report Acknowledged</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={[styles.doneBtn, { backgroundColor: primary }]}>
          <ThemedText style={{ color: "#FFF", fontWeight: "700" }}>Done</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ThemedText type="subtitleSemiBold" style={{ marginBottom: 4 }}>
        Acknowledge this report
      </ThemedText>
      <ThemedText type="small" style={{ color: mutedText, marginBottom: 20 }}>
        Once acknowledged, this can&apos;t be changed — take a moment to review the
        report before submitting.
      </ThemedText>

      <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
        How would you rate this report? (optional)
      </ThemedText>
      <ThemedView style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n === rating ? null : n)} hitSlop={6}>
            <Ionicons
              name={rating != null && n <= rating ? "star" : "star-outline"}
              size={32}
              color={primary}
            />
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 8 }}>
        Feedback (optional)
      </ThemedText>
      <TextInput
        style={[styles.textarea, { borderColor: border, backgroundColor: cardBackground }]}
        placeholder="Share any thoughts with the teacher…"
        placeholderTextColor={mutedText}
        value={feedbackText}
        onChangeText={setFeedbackText}
        multiline
        numberOfLines={5}
        editable={!fetching}
      />

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: primary }, fetching && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={fetching}
      >
        <ThemedText style={{ color: "#FFF", fontWeight: "700" }}>
          {fetching ? "Submitting…" : "Acknowledge Report"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { justifyContent: "center", alignItems: "center" },
  starsRow: { flexDirection: "row", gap: 8 },
  textarea: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, textAlignVertical: "top", minHeight: 100 },
  submitBtn: { marginTop: 24, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  doneBtn: { marginTop: 20, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
});
