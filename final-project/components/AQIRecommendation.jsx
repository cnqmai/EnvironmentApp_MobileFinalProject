import React from "react";
import { View, StyleSheet } from "react-native";
import { Paragraph } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AQIRecommendation = ({ text, iconName, iconColor = "#ff6347" }) => (
  <View style={styles.recommendationItem}>
    <MaterialCommunityIcons
      name={iconName}
      size={24}
      color={iconColor}
      style={styles.icon}
    />
    <Paragraph style={styles.text}>{text}</Paragraph>
  </View>
);

const styles = StyleSheet.create({
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
});

export default AQIRecommendation;
