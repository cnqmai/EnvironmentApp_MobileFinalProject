import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import typography from "../styles/typography";

const RecycleCameraScreen = () => {
  const router = useRouter();

  const stats = [
    { label: "Đã phân loại", value: "1,234", color: "#4CAF50" },
    { label: "Độ chính xác", value: "92%", color: "#2196F3" },
    { label: "Lần dùng", value: "56", color: "#FF9800" },
  ];

  const tips = [
    "Chụp ảnh trong điều kiện ánh sáng tốt",
    "Đặt vật phẩm trên nền đơn giản",
    "Chụp từ nhiều góc độ",
  ];

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
        <Text style={styles.pageTitle}>Nhận diện rác</Text>
        <Text style={styles.subtitle}>
          Chụp hoặc tải ảnh lên để AI nhận diện loại rác
        </Text>

        <View style={styles.uploadArea}>
          <View style={styles.uploadIcon}>
            <MaterialCommunityIcons name="upload" size={48} color="#8E8E93" />
          </View>
          <Text style={styles.uploadTitle}>Tải ảnh lên hoặc chụp ảnh</Text>
          <Text style={styles.uploadSubtitle}>PNG, JPG (tối đa 10MB)</Text>

          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton} activeOpacity={0.9}>
              <MaterialCommunityIcons
                name="tray-arrow-up"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.uploadButtonText}>Chọn ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.9}>
              <MaterialCommunityIcons name="camera" size={20} color="#0A0A0A" />
              <Text style={styles.cameraButtonText}>Chụp</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Mẹo chụp ảnh tốt</Text>
        <View style={styles.tipsContainer}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#4CAF50"
              />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

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
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: "#666666",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  uploadArea: {
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadSubtitle: {
    ...typography.small,
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 24,
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cameraButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  cameraButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statLabel: {
    ...typography.small,
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
    textAlign: "center",
  },
  statValue: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tipsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipText: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    flex: 1,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
});

export default RecycleCameraScreen;
