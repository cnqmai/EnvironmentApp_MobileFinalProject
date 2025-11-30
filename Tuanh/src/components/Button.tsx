import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import colors from "../theme/colors";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export default function Button({ title, onPress, loading }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, loading && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  text: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
