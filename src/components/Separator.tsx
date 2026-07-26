/**
 * Ported from mobile/admin/src/components/Separator.tsx.
 */
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";

export const Separator = () => {
  const { grayMedium } = useThemeColor();
  return (
    <ThemedView style={{ borderBottomWidth: 1, borderBottomColor: grayMedium, marginVertical: 12 }} />
  );
};
