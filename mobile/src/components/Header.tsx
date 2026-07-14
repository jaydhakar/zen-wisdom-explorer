import { Pressable, StyleSheet, View } from "react-native";

import type { LanguageInfo } from "../api";
import { colors, spacing } from "../theme";
import { LanguageToggle } from "./LanguageToggle";

type Props = {
  languages: LanguageInfo[];
  selected: string;
  onSelect: (code: string) => void;
  onMenuPress: () => void;
};

/** Persistent header: hamburger menu (left) + backend-driven language toggle (right). */
export function Header({ languages, selected, onSelect, onMenuPress }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        hitSlop={10}
        style={({ pressed }) => [styles.menu, pressed && styles.menuPressed]}
      >
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </Pressable>

      <LanguageToggle languages={languages} selected={selected} onSelect={onSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  menu: {
    width: 28,
    height: 22,
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  menuPressed: {
    opacity: 0.6,
  },
  line: {
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
});
