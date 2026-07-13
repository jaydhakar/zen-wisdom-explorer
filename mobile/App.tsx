import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchLanguages, type LanguageInfo } from "./src/api";
import { Header } from "./src/components/Header";
import { API_BASE_URL } from "./src/config";
import { colors, spacing } from "./src/theme";

/**
 * Milestone 2: header + language toggle driven by GET /api/languages, plus the
 * typed API layer. The chat body is a placeholder until milestone 3.
 */
export default function App() {
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const langs = await fetchLanguages();
        if (!mounted) return;
        setLanguages(langs);
        setSelected((prev) => prev || langs[0]?.code || "hi");
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load languages.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Header languages={languages} selected={selected} onSelect={setSelected} />

      <View style={styles.body}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.clay} />
            <Text style={styles.muted}>Loading languages…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>Couldn’t reach the backend</Text>
            <Text style={styles.muted}>{error}</Text>
            <Text style={styles.url}>{API_BASE_URL}</Text>
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={styles.ready}>Selected language: {selected || "—"}</Text>
            <Text style={styles.hint}>Chat UI arrives in the next milestone.</Text>
          </View>
        )}
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  muted: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  ready: {
    fontSize: 16,
    color: colors.purpleDeep,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  url: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
