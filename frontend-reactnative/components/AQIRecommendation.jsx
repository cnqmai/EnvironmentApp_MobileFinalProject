import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import typography from "../styles/typography";

// Import hàm lấy màu từ AQICard để đồng bộ logic
import { getAqiInfo } from "./AQICard";

const AQIRecommendation = ({ aqi, text, iconName }) => {
  // Nếu truyền aqi vào, tự động lấy màu tương ứng
  const colorInfo = aqi !== undefined ? getAqiInfo(aqi) : { color: "#FFA726" };
  const displayColor = colorInfo.color;

  return (
    <View style={styles.recommendationItem}>
      <View style={[styles.iconContainer, { backgroundColor: displayColor }]}>
        <MaterialCommunityIcons name={iconName || "information-variant"} size={18} color="#fff" />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Căn lề trên để text dài không bị lệch icon
    marginBottom: 12,
    paddingVertical: 4,
    paddingRight: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  text: {
    ...typography.body,
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22, // Tăng chiều cao dòng cho dễ đọc
    marginTop: 4, // Căn chỉnh với icon
  },
});

export default AQIRecommendation;