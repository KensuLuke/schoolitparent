import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export const useThemeColor = () => {
  const scheme = useColorScheme() ?? "light";
  return Colors[scheme === "dark" ? "dark" : "light"];
};
