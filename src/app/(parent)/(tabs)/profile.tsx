import { StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Card from "@/components/Card";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthStore, useParentStore } from "@/stores/stores";
import { routes } from "@/constants/routes";

export default function ProfileScreen() {
  const { background, primary, mutedText, cardBackground, error: errorColor } = useThemeColor();
  const { profile } = useParentStore();
  const { completeLogout } = useAuthStore();

  const handleLogout = () => {
    completeLogout();
    router.replace(routes.login);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ThemedText type="title" style={styles.header}>
        Profile
      </ThemedText>

      <Card style={[styles.profileCard, { backgroundColor: cardBackground }]}>
        <ThemedView style={[styles.avatar, { backgroundColor: primary + "20" }]}>
          <Ionicons name="person" size={32} color={primary} />
        </ThemedView>
        <ThemedText type="subtitleSemiBold">{profile?.name ?? "Parent"}</ThemedText>
        <ThemedText type="small" style={{ color: mutedText }}>
          {profile?.email ?? ""}
        </ThemedText>
        {profile?.phone && (
          <ThemedText type="small" style={{ color: mutedText }}>
            {profile.phone}
          </ThemedText>
        )}
      </Card>

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: errorColor }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={errorColor} />
        <ThemedText style={{ color: errorColor, fontWeight: "700", marginLeft: 8 }}>
          Log Out
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 16 },
  profileCard: { alignItems: "center", gap: 4, paddingVertical: 24, marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
  },
});
