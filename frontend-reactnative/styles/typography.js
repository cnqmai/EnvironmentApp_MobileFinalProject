// styles/typography.js
// Thư viện style typography dùng chung cho dự án
import { StyleSheet } from "react-native";

export const FONT_FAMILY = "SF Pro Display";

const typography = StyleSheet.create({
  h1: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  h2: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  h3: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: "#222",
  },
  small: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: "#222",
  },
  italic: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontStyle: "italic",
    color: "#222",
  },
  quote: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontStyle: "italic",
    color: "#222",
  },
});

export default typography;
