import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  time: string;
  change: string;
}

export default function HistoryItem({ title, time, change }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.time}>{time}</Text>
      <Text
        style={[
          styles.change,
          {
            color: change.startsWith("-") ? "red" : "#1AA260",
          },
        ]}
      >
        {change}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
  },
  time: {
    fontSize: 13,
    color: "#666",
  },
  change: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "right",
    marginTop: 4,
  },
});
