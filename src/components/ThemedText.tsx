import { StyleSheet, Text, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "subtitleSemiBold"
    | "link"
    | "small"
    | "muted"
    | "header";
};

export function ThemedText({ style, type = "default", ...rest }: ThemedTextProps) {
  const color = useThemeColor().text;

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitleSemiBold" ? styles.subtitleSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "small" ? styles.small : undefined,
        type === "muted" ? styles.muted : undefined,
        type === "header" ? styles.header : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  defaultSemiBold: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "bold", lineHeight: 32 },
  subtitle: { fontSize: 20, fontWeight: "bold" },
  header: { fontSize: 20 },
  subtitleSemiBold: { fontSize: 20, fontWeight: "600" },
  link: { lineHeight: 30, fontSize: 16, color: "#0a7ea4" },
  small: { lineHeight: 16, fontSize: 12, color: "#A9A9A9" },
  muted: { fontSize: 16, lineHeight: 24 },
});
