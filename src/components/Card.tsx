import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

type CardProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export default function Card({ children, style }: CardProps) {
  const { cardBackground } = useThemeColor();
  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground }, style]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, borderRadius: 10, padding: 16, elevation: 2 },
});
