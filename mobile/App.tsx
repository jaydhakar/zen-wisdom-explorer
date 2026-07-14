import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { askWisdom, fetchLanguages, type LanguageInfo } from "./src/api";
import { ChatInput } from "./src/components/ChatInput";
import { Drawer } from "./src/components/Drawer";
import { Header } from "./src/components/Header";
import { MessageList } from "./src/components/MessageList";
import { Welcome } from "./src/components/Welcome";
import { API_BASE_URL } from "./src/config";
import { makeId } from "./src/format";
import { colors, spacing } from "./src/theme";
import type { Message } from "./src/types";
import { sttLocale } from "./src/voice/locales";
import { speakAnswer, stopSpeaking } from "./src/voice/tts";
import { useSpeechToText } from "./src/voice/useSpeechToText";

/**
 * Dark, gold-accented chat app. Shows the Welcome/empty state (hero + greeting
 * + suggestions) until the first message, then the scrolling thread. Header,
 * input bar, and side drawer are persistent. Voice/language/backend logic is
 * unchanged — this file only orchestrates state and layout.
 */
export default function App() {
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        setLoadError(e instanceof Error ? e.message : "Failed to load languages.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Stop any speech when the app is torn down.
  useEffect(() => stopSpeaking, []);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { id: makeId(), role: "user", text: question }]);
    setInput("");
    setSending(true);

    try {
      const res = await askWisdom(question, selected || "hi");
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", text: res.answer, book: res.book },
      ]);
      // Auto-play the answer aloud in the selected language.
      speakAnswer(res.answer, selected || "hi");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { id: makeId(), role: "assistant", text: msg, error: true }]);
    } finally {
      setSending(false);
    }
  }, [input, sending, selected]);

  const handleNewConversation = useCallback(() => {
    stopSpeaking();
    setMessages([]);
    setInput("");
  }, []);

  const { listening, toggle: toggleMic } = useSpeechToText({
    lang: sttLocale(selected),
    onTranscript: setInput,
    onError: (message) => Alert.alert("Voice input", message),
  });

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        languages={languages}
        selected={selected}
        onSelect={setSelected}
        onMenuPress={() => setDrawerOpen(true)}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.muted}>Loading…</Text>
        </View>
      ) : loadError ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Couldn’t reach the backend</Text>
          <Text style={styles.muted}>{loadError}</Text>
          <Text style={styles.url}>{API_BASE_URL}</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {messages.length === 0 ? (
            <Welcome onSelectSuggestion={setInput} />
          ) : (
            <MessageList messages={messages} sending={sending} />
          )}
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={handleSend}
            onMicPress={toggleMic}
            listening={listening}
            sending={sending}
          />
        </KeyboardAvoidingView>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNewConversation={handleNewConversation}
      />

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  flex: {
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
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.errorText,
    marginBottom: spacing.xs,
  },
  url: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
