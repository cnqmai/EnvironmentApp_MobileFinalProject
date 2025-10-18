import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import typography from "../styles/typography";

const AQIRecommendation = ({ text, iconName, iconColor = "#FFA726" }) => (
  <View style={styles.recommendationItem}>
    <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
      <MaterialCommunityIcons name={iconName} size={16} color="#fff" />
    </View>
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingVertical: 2,
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  text: {
    ...typography.body,
    flex: 1,
    fontSize: 14,
    color: "#0A0A0A",
    lineHeight: 20,
    letterSpacing: -0.1,
  },
});

export default AQIRecommendation;
