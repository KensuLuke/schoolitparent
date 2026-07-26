import { StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function NotFoundScreen() {
  const { primary, background, cardBackground, mutedText } = useThemeColor();

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ThemedView style={[styles.card, { backgroundColor: cardBackground }]}>
        <ThemedView style={[styles.iconCircle, { backgroundColor: primary + "18" }]}>
          <Ionicons name="search-outline" size={56} color={primary} />
        </ThemedView>

        <ThemedText type="title" style={styles.code}>
          404
        </ThemedText>
        <ThemedText type="subtitle" style={styles.heading}>
          Page Not Found
        </ThemedText>
        <ThemedText type="muted" style={[styles.description, { color: mutedText }]}>
          The screen you&apos;re looking for doesn&apos;t exist or may have been moved.
        </ThemedText>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: primary }]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        >
          <Ionicons name="arrow-back" size={18} color="#FFF" />
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: { width: 104, height: 104, borderRadius: 52, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  code: { fontSize: 64, fontWeight: "800", lineHeight: 72, marginBottom: 8 },
  heading: { marginBottom: 12, textAlign: "center" },
  description: { textAlign: "center", lineHeight: 22, marginBottom: 32, paddingHorizontal: 8 },
  button: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
