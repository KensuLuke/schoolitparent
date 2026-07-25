import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet } from "react-native";

type Prop = {
  value: string;
  type?: "success" | "alert" | "danger" | "info" | "default";
};

const AUTO_TYPE: Record<string, Prop["type"]> = {
  VERIFIED: "success",
  ACKNOWLEDGED: "success",
  PENDING: "alert",
  SUBMITTED: "alert",
  REVIEWED: "info",
  REJECTED: "danger",
  AUTO_GENERATED: "default",
  DRAFT: "default",
};

export const Badge = ({ value, type }: Prop) => {
  const { blue, green, yellow, red, blueLight, greenLight, yellowLight, redLight, grayLight, text } =
    useThemeColor();

  const resolved = type ?? AUTO_TYPE[value] ?? "default";

  const styleFor = {
    success: { container: { backgroundColor: greenLight }, text: { color: green } },
    alert: { container: { backgroundColor: yellowLight }, text: { color: yellow } },
    danger: { container: { backgroundColor: redLight }, text: { color: red } },
    info: { container: { backgroundColor: blueLight }, text: { color: blue } },
    default: { container: { backgroundColor: grayLight }, text: { color: text } },
  }[resolved];

  return (
    <ThemedView style={[styles.container, styleFor.container]}>
      <ThemedText style={[styles.text, styleFor.text]}>
        {value.replaceAll("_", " ")}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
});
