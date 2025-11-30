import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  subtitle: string;
  point: string;
  backgroundColor: string;
  textColor: string;
}

export default function EarnItem({
  title,
  subtitle,
  point,
  backgroundColor,
  textColor,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Text style={[styles.point, { color: textColor }]}>{point}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    color: "#666",
    fontSize: 13,
  },
  point: {
    fontSize: 15,
    fontWeight: "bold",
  },
});
