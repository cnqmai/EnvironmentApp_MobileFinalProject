import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Button, Paragraph, Caption } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const getAqiInfo = (aqi) => {
  if (aqi <= 50)
    return {
      color: "#00e400",
      status: "Tốt",
      description: "Chất lượng không khí tốt",
    };
  if (aqi <= 100)
    return {
      color: "#ffff00",
      status: "Trung bình",
      description: "Không tốt cho nhóm nhạy cảm",
    };
  if (aqi <= 150)
    return {
      color: "#ff7e00",
      status: "Kém",
      description: "Ảnh hưởng đến sức khỏe",
    };
  if (aqi <= 200)
    return {
      color: "#ff0000",
      status: "Xấu",
      description: "Ảnh hưởng nghiêm trọng",
    };
  if (aqi <= 300)
    return { color: "#8f3f97", status: "Rất xấu", description: "Nguy hiểm" };
  return {
    color: "#7e0023",
    status: "Nguy hiểm",
    description: "Cực kỳ nguy hiểm",
  };
};

const AQICard = ({ location, aqi, description, isSensitiveGroup, onPress }) => {
  const { color, status } = getAqiInfo(aqi);
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate("AQIDetail", {
        location,
        aqi,
        description,
        isSensitiveGroup,
      });
    }
  };

  return (
    <Card style={StyleSheet.card} onPress={handlePress}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text style={styles.locationText}>{location.name}</Text>
            <Caption style={styles.cityText}>{location.city}</Caption>{" "}
          </View>
          <View style={[styles.aqiContainer, { backgroundColor: color }]}>
            <Text style={styles.aqiText}>{aqi}</Text>
            <Text style={styles.aqiLabel}>AQI</Text>
          </View>
        </View>

        <Paragraph style={styles.statusText}>{status}</Paragraph>
        {isSensitiveGroup && (
          <Paragraph style={styles.sensitiveText}>
            Người già, trẻ em, người có bệnh hô hấp nên hạn chế ra ngoài
          </Paragraph>
        )}
        {!isSensitiveGroup && description && (
          <Caption style={styles.descriptionText}>{description}</Caption>
        )}

        {onPress && (
          <Button mode="text" onPress={handlePress} style={styles.detailButton}>
            Xem chi tiết
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  cityText: {
    fontSize: 14,
    color: "#666",
    marginTop: -4,
  },
  aqiContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  aqiText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  aqiLabel: {
    fontSize: 10,
    color: "#fff",
    lineHeight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
  },
  sensitiveText: {
    color: "#dc3545",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  descriptionText: {
    color: "#777",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  detailButton: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
});

export default AQICard;
