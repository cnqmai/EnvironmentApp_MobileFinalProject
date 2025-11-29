import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import typography, { FONT_FAMILY } from "../styles/typography";

// CẬP NHẬT LOGIC HIỂN THỊ THEO YÊU CẦU
export const getAqiInfo = (aqi) => {
  if (aqi <= 50) {
    return {
      color: "#4CAF50", // Xanh lá
      status: "Tốt",
      description: "Không khí trong lành.",
    };
  } else if (aqi <= 100) {
    return {
      color: "#FFC107", // Vàng
      status: "Trung bình",
      description: "Chất lượng chấp nhận được.",
    };
  } else if (aqi <= 150) {
    return {
      color: "#FF9800", // Cam
      status: "Kém",
      description: "Nhóm nhạy cảm cần lưu ý.",
    };
  } else if (aqi <= 200) {
    return {
      color: "#F44336", // Đỏ
      status: "Xấu",
      description: "Có hại cho sức khỏe.",
    };
  } else if (aqi <= 300) { // Khoảng 201-300
    return {
      color: "#9C27B0", // Tím
      status: "Rất xấu",
      description: "Cảnh báo khẩn cấp.",
    };
  } else {
    return {
      color: "#7E0023", // Nâu đỏ (Maroon)
      status: "Nguy hiểm", // Đúng tên gọi yêu cầu
      description: "Báo động! Tránh ra ngoài.",
    };
  }
};

const AQICard = ({ location, aqi, description, isSensitiveGroup, onPress }) => {
  const { color, status, description: defaultDesc } = getAqiInfo(aqi);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDetailPress = () => {
    if (onPress) {
      onPress();
    }
  };

  const displayDesc = description || defaultDesc;

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
        <Text style={styles.descText}>{displayDesc}</Text>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.recommendationTitle}>
              Khuyến nghị hành động
            </Text>

            <View style={styles.recommendationItem}>
              <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Text style={styles.iconText}>😷</Text>
              </View>
              <Text style={styles.recommendationText}>
                {aqi > 100 
                  ? "Nên đeo khẩu trang chống bụi mịn khi ra ngoài." 
                  : "Không cần khẩu trang chuyên dụng."}
              </Text>
            </View>

            <View style={styles.recommendationItem}>
              <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Text style={styles.iconText}>🏠</Text>
              </View>
              <Text style={styles.recommendationText}>
                {aqi > 150 
                  ? "Nên đóng kín cửa sổ và hạn chế ra ngoài." 
                  : "Mở cửa sổ để không khí lưu thông."}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleDetailPress}
              style={[styles.detailButton, { backgroundColor: color }]}
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
    paddingRight: 10,
  },
  locationText: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "800",
    color: "#0A0A0A",
  },
  cityText: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  aqiContainer: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 65,
    backgroundColor: "#fff",
  },
  aqiText: {
    ...typography.h1,
    fontSize: 26,
    fontWeight: "900",
  },
  aqiLabel: {
    ...typography.small,
    fontSize: 10,
    color: "#666",
    fontWeight: "700",
  },
  statusText: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
    textTransform: "uppercase",
  },
  descText: {
    ...typography.body,
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  recommendationTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 14,
  },
  recommendationText: {
    ...typography.body,
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  detailButton: {
    alignSelf: "flex-end",
    marginTop: 15,
    borderRadius: 20,
  },
  detailButtonContent: {
    paddingHorizontal: 12,
    height: 36,
  },
  detailButtonLabel: {
    ...typography.h3,
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});

export default AQICard;