import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AQIRecommendation from "../components/AQIRecommendation";
import { getAqiInfo } from "../components/AQICard";
import typography, { FONT_FAMILY } from "../styles/typography";

const screenWidth = Dimensions.get("window").width;

const AQIDetailScreen = () => {
  const router = useRouter();
  const routeParams = useLocalSearchParams();
  const { locationName, locationCity, aqi, isSensitiveGroup } = routeParams;
  const [menuVisible, setMenuVisible] = useState(false);

  const location = {
    name: locationName || "Unknown",
    city: locationCity || "Unknown",
  };

  const isSensitive = isSensitiveGroup === "true" || isSensitiveGroup === true;

  // Dữ liệu biểu đồ AQI theo giờ với màu sắc động
  const hourlyAqiData = [48, 65, 115, 143, 95, 82, 135, 188, 165];

  const getChartColor = (values) => {
    const maxValue = Math.max(...values);
    if (maxValue <= 50) return "#4CAF50";
    if (maxValue <= 100) return "#FFC107";
    if (maxValue <= 150) return "#FF9800";
    if (maxValue <= 200) return "#F44336";
    if (maxValue <= 300) return "#9C27B0";
    return "#795548";
  };

  const hexToRgba = (hex, opacity = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const chartData = {
    labels: ["0h", "3h", "6h", "9h", "12h", "15h", "18h", "21h", "24h"],
    datasets: [
      {
        data: hourlyAqiData,
        color: (opacity = 1) =>
          hexToRgba(getChartColor(hourlyAqiData), opacity),
        strokeWidth: 3,
      },
      // Dataset ẩn để thiết lập scale Y theo các mốc AQI
      {
        data: [0, 300], // Min và max để tạo scale phù hợp
        withDots: false,
        strokeWidth: 0,
        color: () => "transparent",
      },
    ],
  };

  const { color, status } = getAqiInfo(parseFloat(aqi));

  const renderColoredAreas = () => {
    const legendItems = [
      { label: "Tốt", range: "(0-50)" },
      { label: "Trung bình", range: "(51-100)" },
      { label: "Kém", range: "(101-150)" },
      { label: "Xấu", range: "(151-200)" },
      { label: "Rất xấu", range: "(201-300)" },
      { label: "Nguy hiểm", range: "(300+)" },
    ];

    return (
      <View style={styles.chartLegendContainer}>
        <Text style={styles.legendTitle}>Chú thích</Text>
        <View style={styles.legendGrid}>
          {legendItems.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendRange}>{item.range}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuDots}>•••</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.aqiSummaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryLocationContainer}>
              <Text style={styles.summaryLocationText}>
                {location?.name || "Unknown"}, {location?.city || "Unknown"}
              </Text>
              {isSensitive && (
                <Text style={styles.summarySensitiveText}>
                  Không tốt cho nhóm nhạy cảm
                </Text>
              )}
            </View>
            <View style={styles.summaryAqiWrap}>
              <View
                style={[styles.summaryAqiContainer, { borderColor: color }]}
              >
                <Text style={[styles.summaryAqiText, { color }]}>
                  {aqi || "0"}
                </Text>
                <Text style={styles.summaryAqiLabel}>AQI</Text>
              </View>
              <Text style={[styles.summaryStatusText, { color }]}>
                {status || "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            Chỉ số chất lượng không khí theo giờ - Hôm nay
          </Text>
          <LineChart
            data={chartData}
            width={screenWidth - 60}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            segments={5}
            withVerticalLines={false}
            withHorizontalLines={true}
            withInnerLines={true}
            withOuterLines={false}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) =>
                hexToRgba(getChartColor(hourlyAqiData), opacity),
              labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
              propsForDots: {
                r: "8",
                strokeWidth: "0",
                stroke: "transparent",
                fill: getChartColor(hourlyAqiData),
                fillOpacity: 1,
              },
              propsForBackgroundLines: {
                strokeDasharray: "0",
                stroke: "#E8E8E8",
                strokeWidth: 1,
              },
              fillShadowGradient: getChartColor(hourlyAqiData),
              fillShadowGradientFrom: getChartColor(hourlyAqiData),
              fillShadowGradientFromOpacity: 0.3,
              fillShadowGradientTo: "#ffffff",
              fillShadowGradientToOpacity: 0.05,
              useShadowColorFromDataset: false,
            }}
            bezier
            style={styles.chartStyle}
            fromZero={true}
            yLabelsOffset={8}
          />
          {renderColoredAreas()}
        </View>

        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>Khuyến nghị hành động</Text>
          <AQIRecommendation
            iconName="account-alert"
            iconColor="#FFA726"
            text="Người già, trẻ em, người có bệnh hô hấp nên hạn chế ra ngoài"
          />
          <AQIRecommendation
            iconName="face-mask"
            iconColor="#FFA726"
            text="Đeo khẩu trang chống bụi mịn khi ra ngoài"
          />
        </View>
      </ScrollView>
      <Modal
        animation="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/settings/aqi-threshold");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.menuIcon}>⚙</Text>
              <Text style={styles.menuText}>Cài đặt ngưỡng cảnh báo</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F0EFED",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E9EA",
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2 
  },
  backText: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: "700",
    color: "#007AFF",
    letterSpacing: -0.2,
  },
  menuButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(102, 102, 102, 0.1)",
  },
  menuDots: {
    fontSize: 22,
    fontWeight: "800",
    color: "#666",
    letterSpacing: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 12,
    flexGrow: 1,
  },
  aqiSummaryCard: {
    backgroundColor: "#fff",
    marginVertical: 12,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignSelf: "stretch",
    flexShrink: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryLocationContainer: {
    flex: 1,
  },
  summaryLocationText: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: "800",
    color: "#0A0A0A",
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  summarySensitiveText: {
    ...typography.body,
    color: "#dc3545",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
    letterSpacing: -0.1,
  },
  summaryAqiWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  summaryAqiContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    backgroundColor: "#fff",
    borderWidth: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryAqiText: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  summaryAqiLabel: {
    ...typography.small,
    fontSize: 11,
    color: "#666",
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  summaryStatusText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    letterSpacing: -0.2,
  },

  chartCard: {
    backgroundColor: "#fff",
    marginVertical: 12,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 28,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignSelf: "stretch",
    flexShrink: 1,
  },
  chartTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 32,
    color: "#0A0A0A",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  chartStyle: {
    borderRadius: 20,
    marginVertical: 16,
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  chartLegendContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  legendTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 16,
    textAlign: "left",
    letterSpacing: -0.2,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "31%",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    ...typography.small,
    fontSize: 12,
    color: "#0A0A0A",
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: -0.1,
  },
  legendRange: {
    ...typography.small,
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
    marginTop: 1,
    letterSpacing: 0.2,
  },

  recommendationCard: {
    backgroundColor: "#fff",
    marginVertical: 12,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignSelf: "stretch",
    flexShrink: 1,
  },
  recommendationTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    color: "#0A0A0A",
    letterSpacing: -0.4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 70,
    marginRight: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
    flex: 1,
    letterSpacing: -0.2,
  },

  bottomButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8E9EA",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  settingsIcon: {
    fontSize: 18,
    marginRight: 12,
    color: "#666",
  },
  settingsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default AQIDetailScreen;
