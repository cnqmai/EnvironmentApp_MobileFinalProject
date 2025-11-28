import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import typography from "../styles/typography";
import { getCategoryBySlug } from "../src/services/categoryService"; // Import service

const RecycleGuideScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  // type chính là slug (organic, recyclable, v.v.)
  const { type, title: paramTitle } = params; 

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy dữ liệu thật
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        if (type) {
          const data = await getCategoryBySlug(type);
          setCategoryData(data);
        }
      } catch (error) {
        console.error("Lỗi lấy hướng dẫn tái chế:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, [type]);

  // Xử lý hiển thị màu sắc (Vẫn có thể giữ logic màu ở frontend hoặc lấy từ DB nếu có trường color)
  const getBackgroundColor = (slugType) => {
    const colors = {
      organic: "#E8F5E9",
      recyclable: "#E3F2FD",
      hazardous: "#FFF3E0",
      electronic: "#EDE7F6",
      glass: "#E0F7FA",
      textile: "#FCE4EC",
      default: "#F5F5F5"
    };
    return colors[slugType] || colors.default;
  };

  // Xử lý tách chuỗi hướng dẫn thành mảng (Do DB lưu dạng text ngăn cách bởi \n)
  const getSteps = () => {
    if (categoryData && categoryData.guidelines) {
      // Tách chuỗi bằng ký tự xuống dòng
      return categoryData.guidelines.split('\n').filter(step => step.trim() !== '');
    }
    return ["Thông tin đang cập nhật"];
  };

  // Nếu đang tải
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Tiêu đề và subtitle ưu tiên lấy từ API, nếu không có thì lấy từ params hoặc mặc định
  const displayTitle = categoryData?.name || paramTitle || "Chi tiết";
  const displaySubtitle = categoryData?.subtitle || "Thông tin đang cập nhật";
  const steps = getSteps();

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
          <Text style={styles.resultTitle}>{displayTitle}</Text>
          <Text style={styles.resultSubtitle}>{displaySubtitle}</Text>
        </View>

        <Text style={styles.sectionTitle}>Hướng dẫn xử lí</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
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
            Hãy chung tay bảo vệ môi trường bằng cách phân loại rác đúng quy định!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Điểm thu gom gần bạn</Text>
        {/* Phần này tạm thời giữ tĩnh hoặc gọi API LocationService nếu cần */}
        <View style={styles.locationCard}>
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
                <Text style={styles.locationName}>Trung tâm tái chế xanh</Text>
                <Text style={styles.locationAddress}>
                  123 Nguyễn Văn Linh, Q.7
                </Text>
              </View>
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>1.2 km</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursText}>Mở cửa: 7:00 - 18:00</Text>
          </View>
        </View>

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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: "center", // Canh giữa subtitle
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