import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import typography from "../../styles/typography";

const RecycleScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tái chế</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Chọn loại rác</Text>
          <Text style={styles.subtitle}>
            Chọn loại rác bạn muốn xử lí để nhận hướng dẫn chi tiết
          </Text>
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity style={[styles.wasteCard, styles.organicWaste]}>
            <MaterialCommunityIcons name="leaf" size={40} color="#2E7D32" />
            <Text style={styles.wasteTitle}>Rác hữu cơ</Text>
            <Text style={styles.wasteSubtitle}>Thực phẩm, lá cây</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wasteCard, styles.recycleWaste]}>
            <MaterialCommunityIcons name="recycle" size={40} color="#1976D2" />
            <Text style={styles.wasteTitle}>Rác tái chế</Text>
            <Text style={styles.wasteSubtitle}>Giấy, nhựa, kim loại</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wasteCard, styles.hazardousWaste]}>
            <MaterialCommunityIcons name="alert" size={40} color="#F57C00" />
            <Text style={styles.wasteTitle}>Rác nguy hại</Text>
            <Text style={styles.wasteSubtitle}>Pin, hóa chất</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wasteCard, styles.electronicWaste]}>
            <MaterialCommunityIcons name="laptop" size={40} color="#512DA8" />
            <Text style={styles.wasteTitle}>Rác điện tử</Text>
            <Text style={styles.wasteSubtitle}>Máy tính, điện thoại</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wasteCard, styles.glassWaste]}>
            <MaterialCommunityIcons name="cup" size={40} color="#0097A7" />
            <Text style={styles.wasteTitle}>Rác thủy tinh</Text>
            <Text style={styles.wasteSubtitle}>Chai lọ, kính vỡ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.wasteCard, styles.fabricWaste]}>
            <MaterialCommunityIcons name="hanger" size={40} color="#C2185B" />
            <Text style={styles.wasteTitle}>Rác vải</Text>
            <Text style={styles.wasteSubtitle}>Quần áo, vải vụn</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="magnify" size={20} color="#0A0A0A" />
            <Text style={styles.actionButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="camera" size={20} color="#0A0A0A" />
            <Text style={styles.actionButtonText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  wasteCard: {
    width: "47%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  organicWaste: {
    backgroundColor: "#E8F5E9",
  },
  recycleWaste: {
    backgroundColor: "#E3F2FD",
  },
  hazardousWaste: {
    backgroundColor: "#FFF3E0",
  },
  electronicWaste: {
    backgroundColor: "#EDE7F6",
  },
  glassWaste: {
    backgroundColor: "#E0F7FA",
  },
  fabricWaste: {
    backgroundColor: "#FCE4EC",
  },
  wasteTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A0A0A",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  wasteSubtitle: {
    ...typography.small,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
  },
});

export default RecycleScreen;
