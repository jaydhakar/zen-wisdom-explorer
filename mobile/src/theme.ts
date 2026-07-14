/**
 * Visual language: a dark, gold-accented, cinematic theme.
 *
 * Near-black navy backgrounds with warm amber-gold accents, tuned to sit under
 * the hero illustration (assets/hero-monk.jpg). All text/background pairs here
 * were verified against WCAG AA (>= 4.5:1 for normal text) before use.
 */

import { Platform } from "react-native";

export const colors = {
  // Backgrounds
  background: "#0B0E15", // near-black navy
  backgroundElevated: "#12161F",
  surface: "#151A24",

  // Gold accents
  gold: "#E3B15C",
  goldDim: "#C9974A",

  // Chat bubbles (distinct, legible on dark)
  assistantBubble: "#1C2230", // cool dark slate
  userBubble: "#3A2E1C", // warm dark bronze

  // Text
  textPrimary: "#F3ECE0", // warm off-white  (16.4:1 on bg)
  textSecondary: "#C8C0B2", // (10.7:1 on bg)
  textMuted: "#9A9385", // (6.3:1 on bg)
  citation: "#B3A98F", // muted, not stark white  (6.8:1 on assistant bubble)
  onGold: "#141007", // dark text/icon on gold fills

  // Feedback
  errorBubble: "#2E1B17",
  errorText: "#EA9A86",

  // Lines / borders / surfaces
  border: "rgba(227,177,92,0.22)", // faint gold
  borderSubtle: "rgba(255,255,255,0.09)",
  inputBg: "rgba(255,255,255,0.06)",
  pillBg: "rgba(255,255,255,0.05)",
  overlay: "rgba(0,0,0,0.6)",
} as const;

export const fonts = {
  serif: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }) as string,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};
