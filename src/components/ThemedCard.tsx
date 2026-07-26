/**
 * Ported from mobile/admin/src/components/ThemedCard.tsx for the SchoolIt
 * Social feed/detail screens — parent's own component set didn't have this
 * yet (see mobile/admin's CLAUDE.md reusable-components rule: flagging
 * this port since it's a new shared component in this app).
 */
import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function ThemedCard({ children, style }: Props) {
  const { cardBackground } = useThemeColor();
  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground }, style]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, padding: 16, elevation: 2 },
});
