import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import typography from "../styles/typography";
import { getSavedLocations } from "../src/services/locationService";

const RecycleGuideScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type, title, subtitle: customSubtitle } = params;

  const getDefaultSubtitle = (type) => {
    switch (type) {
      case "organic":
        return "VD: Thực phẩm thừa, vỏ trái cây, lá cây";
      case "recyclable":
        return "VD: Chai nhựa, giấy, kim loại";
      case "hazardous":
        return "VD: Pin, hóa chất, thuốc trừ sâu";
      case "electronic":
        return "VD: Điện thoại, laptop, TV cũ";
      case "glass":
        return "VD: Chai lọ thủy tinh, kính vỡ";
      case "textile":
        return "VD: Quần áo cũ, vải vụn, khăn trải";
      default:
        return "Thông tin đang cập nhật";
    }
  };

  const getGuideContent = () => {
    const displaySubtitle = customSubtitle || getDefaultSubtitle(type);

    switch (type) {
      case "organic":
        return {
          subtitle: displaySubtitle,
          howToRecycle: [
            "Phân loại riêng khỏi rác khác",
            "Có thể ủ compost tại nhà",
            "Bỏ vào thùng rác màu xanh lá",
          ],
        };
      case "recyclable":
        return {
          subtitle: displaySubtitle,
          howToRecycle: [
            "Rửa sạch chai, loại bỏ nhãn và nắp",
            "Đặt vào thùng rác tái chế màu xanh",
            "Hoặc đem đến điểm thu gom gần nhất",
          ],
        };
      case "hazardous":
        return {
          subtitle: displaySubtitle,
          howToRecycle: [
            "KHÔNG bỏ chung với rác thường",
            "Mang đến điểm thu gom chuyên dụng",
            "Liên hệ cơ quan môi trường địa phương",
          ],
        };
      case "electronic":
        return {
          subtitle: displaySubtitle,
          howToRecycle: [
            "Xóa dữ liệu cá nhân trước khi thanh lý",
            "Mang đến cửa hàng có thu hồi",
            "Liên hệ đơn vị thu gom chuyên nghiệp",
          ],
        };
      case "glass":
        return {
          subtitle: displaySubtitle,
          howToRecycle: [
            "Rửa sạch trước khi bỏ",
            "Tách riêng nắp kim loại/nhựa",
            "Bỏ vào thùng riêng để tránh vỡ",
          ],
        };
      case "textile":
        return {
          subtitle: displaySubtitle,
          howToRecycle: [
            "Quần áo còn tốt: quyên góp từ thiện",
            "Vải vụn: mang đến điểm thu gom",
            "Tìm thùng thu gom quần áo cũ",
          ],
        };
      default:
        return {
          subtitle: displaySubtitle,
          howToRecycle: ["Vui lòng quay lại sau"],
        };
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case "organic":
        return "#E8F5E9";
      case "recyclable":
        return "#E3F2FD";
      case "hazardous":
        return "#FFF3E0";
      case "electronic":
        return "#EDE7F6";
      case "glass":
        return "#E0F7FA";
      case "textile":
        return "#FCE4EC";
      default:
        return "#F5F5F5";
    }
  };

  const content = getGuideContent();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getSavedLocations();
        if (mounted) setLocations(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0A0A0A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Kết quả phân loại</Text>

        <View
          style={[
            styles.resultCard,
            { backgroundColor: getBackgroundColor(type) },
          ]}
        >
          <View style={styles.resultIconContainer}>
            <View style={styles.resultIconCircle}>
              <MaterialCommunityIcons name="check" size={28} color="#4CAF50" />
            </View>
          </View>
          <Text style={styles.resultTitle}>{title}</Text>
          <Text style={styles.resultSubtitle}>{content.subtitle}</Text>
        </View>

        <Text style={styles.sectionTitle}>Hướng dẫn xử lí</Text>
        <View style={styles.stepsContainer}>
          {content.howToRecycle.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color="#007AFF"
          />
          <Text style={styles.infoText}>
            Bạn có thể tái sử dụng chai đựa để trồng cây hoặc làm đồ handmade!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Điểm thu gom đã lưu</Text>
        {(loading ? [] : locations).slice(0, 3).map((loc, idx) => (
          <View key={idx} style={styles.locationCard}>
            <TouchableOpacity
              style={styles.locationTouchable}
              activeOpacity={0.8}
            >
              <View style={styles.locationInfo}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color="#0A0A0A"
                />
                <View style={styles.locationDetails}>
                  <Text style={styles.locationName}>{loc?.name || loc?.title || "Điểm thu gom"}</Text>
                  <Text style={styles.locationAddress}>
                    {loc?.address || loc?.city || ""}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.mapButton} activeOpacity={0.9}>
          <Text style={styles.mapButtonText}>Xem bản đồ</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F0EFED",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  pageTitle: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: "700",
    color: "#0A0A0A",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  resultCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  resultIconContainer: {
    marginBottom: 16,
  },
  resultIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 6,
  },
  resultSubtitle: {
    ...typography.body,
    fontSize: 15,
    color: "#666666",
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    paddingHorizontal: 24,
    marginBottom: 12,
    marginTop: 8,
  },
  stepsContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    ...typography.small,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepText: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    flex: 1,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    ...typography.body,
    fontSize: 14,
    color: "#007AFF",
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  locationAddress: {
    ...typography.small,
    fontSize: 14,
    color: "#666666",
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  distanceText: {
    ...typography.small,
    fontSize: 13,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  hoursContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  hoursText: {
    ...typography.small,
    fontSize: 13,
    color: "#4CAF50",
  },
  mapButton: {
    backgroundColor: "#0A0A0A",
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mapButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bottomPadding: {
    height: 40,
  },
});

export default RecycleGuideScreen;
