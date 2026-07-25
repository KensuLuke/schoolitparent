import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { ReactNode } from "react";

type Props = {
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ClickableCard({ onPress, children, style }: Props) {
  const { cardBackground } = useThemeColor();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBackground }, style]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 10, elevation: 2 },
});
