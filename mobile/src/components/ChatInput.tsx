import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onMicPress: () => void;
  listening: boolean;
  sending: boolean;
  placeholder?: string;
};

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onMicPress,
  listening,
  sending,
  placeholder,
}: Props) {
  const canSend = value.trim().length > 0 && !sending;

  // Soft pulsing ring around the mic while actively listening.
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!listening) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true })
    );
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(0);
    };
  }, [listening, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={styles.container}>
      <View style={styles.micWrap}>
        {listening ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
          />
        ) : null}
        <Pressable
          onPress={onMicPress}
          accessibilityRole="button"
          accessibilityLabel={listening ? "Stop listening" : "Start voice input"}
          style={[styles.micButton, listening && styles.micButtonActive]}
        >
          <Text style={styles.micIcon}>{listening ? "⏹" : "🎤"}</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Ask your question…"}
        placeholderTextColor={colors.textMuted}
        multiline
        editable={!sending}
        onSubmitEditing={canSend ? onSend : undefined}
        returnKeyType="send"
        blurOnSubmit={false}
      />

      <Pressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send"
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
      >
        <Text style={[styles.sendIcon, !canSend && styles.sendIconDisabled]}>➤</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  micWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonActive: {
    backgroundColor: colors.goldDim,
  },
  micIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
    backgroundColor: colors.inputBg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderSubtle,
  },
  sendIcon: {
    fontSize: 18,
    color: colors.onGold,
    marginLeft: 2,
  },
  sendIconDisabled: {
    color: colors.textMuted,
  },
});
