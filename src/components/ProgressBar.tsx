/**
 * Ported from mobile/admin/src/components/ProgressBar.tsx for the SchoolIt
 * Social vote-tally UI — adapted to this app's color tokens (no `grayDark`
 * token exists in constants/colors.ts, so `primary` is the fill default).
 */
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ViewStyle } from "react-native";

type Props = {
  value?: number;
  style?: ViewStyle;
  color?: string;
};

export function ProgressBar({ value = 0, style, color }: Props) {
  const { primary, grayMedium } = useThemeColor();
  return (
    <ThemedView
      style={[
        { borderRadius: 15, padding: 0, width: "100%", height: 8, backgroundColor: grayMedium, overflow: "hidden" },
        style,
      ]}
    >
      <ThemedView
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          backgroundColor: color || primary,
        }}
      />
    </ThemedView>
  );
}
