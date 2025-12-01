import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker'; // Thư viện ảnh
import typography from "../styles/typography";
// Import API
import { classifyWasteByImage } from "../src/services/categoryService";
import { addRecyclePoints } from "../src/services/userService"; // <--- ĐÃ THÊM

const RecycleCameraScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- LOGIC XỬ LÝ ẢNH ---
  const handleImage = async (uri) => {
    setLoading(true);
    try {
        // Gửi ảnh lên Backend -> AI Gemini
        const result = await classifyWasteByImage(uri);
        
        if (result && result.name) {
            // *** CỘNG ĐIỂM (FR-9.1.1) ***
            try {
                await addRecyclePoints(); 
                console.log("Đã cộng 10 điểm cho người dùng.");
            } catch (pointError) {
                console.error("Lỗi cộng điểm:", pointError);
            }
            // ****************************

            // Có kết quả -> Sang màn hình hướng dẫn
            router.push({
                pathname: "/recycle-guide",
                params: { data: JSON.stringify(result) }
            });
        } else {
            Alert.alert("Thất bại", "AI không nhận diện được vật phẩm trong ảnh.");
        }
    } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể kết nối máy chủ.");
    } finally {
        setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) handleImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return Alert.alert("Cần quyền", "Vui lòng cấp quyền camera.");
    let result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) handleImage(result.assets[0].uri);
  };
  // -----------------------

  const stats = [
    { label: "Đã phân loại", value: "1,234", color: "#4CAF50" },
    { label: "Độ chính xác", value: "92%", color: "#2196F3" },
    { label: "Lần dùng", value: "56", color: "#FF9800" },
  ];

  const tips = ["Chụp ảnh đủ sáng", "Vật phẩm nằm giữa hình", "Nền đơn giản"];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {loading && (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={{marginTop: 10, fontWeight: 'bold', color: '#fff'}}>Đang phân tích ảnh...</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0A0A0A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.pageTitle}>AI Nhận diện rác</Text>
        <Text style={styles.subtitle}>Chụp hoặc tải ảnh lên để AI phân tích</Text>

        <View style={styles.uploadArea}>
          <MaterialCommunityIcons name="upload" size={48} color="#8E8E93" style={{marginBottom: 16}}/>
          <Text style={styles.uploadTitle}>Tải ảnh lên hoặc chụp ảnh</Text>
          <Text style={styles.uploadSubtitle}>PNG, JPG (tối đa 10MB)</Text>

          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton} activeOpacity={0.9} onPress={pickImage}>
              <MaterialCommunityIcons name="tray-arrow-up" size={20} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>Chọn ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.9} onPress={takePhoto}>
              <MaterialCommunityIcons name="camera" size={20} color="#0A0A0A" />
              <Text style={styles.cameraButtonText}>Chụp</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Mẹo chụp ảnh tốt</Text>
        <View style={styles.tipsContainer}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFED" },
  header: { padding: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", elevation: 2 },
  scrollView: { flex: 1 },
  pageTitle: { ...typography.h1, fontSize: 28, fontWeight: "700", paddingHorizontal: 24, marginBottom: 8 },
  subtitle: { ...typography.body, fontSize: 15, color: "#666", paddingHorizontal: 24, marginBottom: 24 },
  uploadArea: { marginHorizontal: 24, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 2, borderColor: "#E0E0E0", borderStyle: "dashed", padding: 32, alignItems: "center", marginBottom: 24 },
  uploadTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  uploadSubtitle: { fontSize: 13, color: "#8E8E93", marginBottom: 24 },
  uploadButtons: { flexDirection: "row", gap: 12, width: "100%" },
  uploadButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#0A0A0A", paddingVertical: 14, borderRadius: 12, gap: 8 },
  uploadButtonText: { color: "#FFF", fontWeight: "600" },
  cameraButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF", paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0", gap: 8 },
  cameraButtonText: { color: "#000", fontWeight: "600" },
  statsContainer: { flexDirection: "row", paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: "#F5F5F5", borderRadius: 12, padding: 16, alignItems: "center" },
  statLabel: { fontSize: 12, color: "#666", marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", paddingHorizontal: 24, marginBottom: 16 },
  tipsContainer: { paddingHorizontal: 24, gap: 12, marginBottom: 40 },
  tipItem: { flexDirection: "row", gap: 12 },
  tipText: { fontSize: 15, color: "#0A0A0A" },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }
});

export default RecycleCameraScreen;