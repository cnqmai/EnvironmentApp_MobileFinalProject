import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import typography, { FONT_FAMILY } from "../styles/typography";

export const getAqiInfo = (aqi) => {
  if (aqi <= 50)
    return {
      color: "#4CAF50",
      status: "Tốt",
      description: "Chất lượng không khí tốt",
    };
  if (aqi <= 100)
    return {
      color: "#FFC107",
      status: "Trung bình",
      description: "Không tốt cho nhóm nhạy cảm",
    };
  if (aqi <= 150)
    return {
      color: "#FF9800",
      status: "Kém",
      description: "Ảnh hưởng đến sức khỏe",
    };
  if (aqi <= 200)
    return {
      color: "#F44336",
      status: "Xấu",
      description: "Ảnh hưởng nghiêm trọng",
    };
  if (aqi <= 300)
    return { color: "#9C27B0", status: "Rất xấu", description: "Nguy hiểm" };
  return {
    color: "#795548",
    status: "Nguy hiểm",
    description: "Cực kỳ nguy hiểm",
  };
};

const AQICard = ({ location, aqi, description, isSensitiveGroup, onPress }) => {
  const { color, status } = getAqiInfo(aqi);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDetailPress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <Card
      style={[styles.card, isExpanded && styles.cardExpanded]}
      onPress={toggleExpansion}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {location.name}
              {"\n"}
              <Text style={styles.cityText}>{location.city}</Text>
            </Text>
          </View>
          <View style={[styles.aqiContainer, { borderColor: color }]}>
            <Text style={[styles.aqiText, { color }]}>{aqi}</Text>
            <Text style={styles.aqiLabel}>AQI</Text>
          </View>
        </View>

        <Text style={[styles.statusText, { color }]}>{status}</Text>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.recommendationTitle}>
              Khuyến nghị hành động
            </Text>

            <View style={styles.recommendationItem}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>😷</Text>
              </View>
              <Text style={styles.recommendationText}>
                Người già, trẻ em, người có bệnh hô hấp nên hạn chế ra ngoài
              </Text>
            </View>

            <View style={styles.recommendationItem}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>😷</Text>
              </View>
              <Text style={styles.recommendationText}>
                Đeo khẩu trang chống bụi mịn khi ra ngoài
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleDetailPress}
              style={styles.detailButton}
              labelStyle={styles.detailButtonLabel}
              contentStyle={styles.detailButtonContent}
            >
              Xem chi tiết
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignSelf: "stretch",
    flexShrink: 1,
    transform: [{ scale: 1 }],
  },
  cardExpanded: {
    elevation: 6,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    transform: [{ scale: 1.01 }],
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  locationContainer: {
    flex: 1,
  },
  locationText: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "800",
    color: "#0A0A0A",
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  cityText: {
    ...typography.body,
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  aqiContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aqiText: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  aqiLabel: {
    ...typography.small,
    fontSize: 10,
    color: "#666",
    fontWeight: "700",
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
  statusText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 8,
    letterSpacing: -0.2,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  recommendationTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "800",
    color: "#0A0A0A",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFA726",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 12,
  },
  recommendationText: {
    ...typography.body,
    flex: 1,
    fontSize: 14,
    color: "#0A0A0A",
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  detailButton: {
    alignSelf: "flex-end",
    marginTop: 20,
    marginBottom: 4,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    elevation: 2,
  },
  detailButtonContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailButtonLabel: {
    ...typography.h3,
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
});

export default AQICard;
