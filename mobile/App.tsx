import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { API_BASE_URL } from "./src/config";

/**
 * Milestone 1 placeholder: proves the scaffold + env plumbing work before we
 * build the real chat UI (milestone 3) and wire voice (milestones 4–5).
 */
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕉️ Zen Wisdom Explorer</Text>
      <Text style={styles.subtitle}>Scaffold ready</Text>
      <Text style={styles.meta}>API base URL:</Text>
      <Text style={styles.url}>{API_BASE_URL}</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3ECE2",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4A3F5C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8A7CA8",
    marginBottom: 24,
  },
  meta: {
    fontSize: 13,
    color: "#9B8E7E",
  },
  url: {
    fontSize: 15,
    color: "#4A3F5C",
    fontWeight: "500",
    marginTop: 2,
  },
});
