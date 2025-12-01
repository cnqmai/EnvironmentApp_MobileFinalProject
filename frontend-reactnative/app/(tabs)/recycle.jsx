import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import typography, { FONT_FAMILY } from "../../styles/typography";
import { getAllCategories } from "../../src/services/categoryService";

const RecycleScreen = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. LẤY DỮ LIỆU TỪ API ---
  const fetchData = useCallback(async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // --- 2. LOGIC ÁNH XẠ THÔNG MINH (Dựa trên Tên Tiếng Việt) ---
  const getCategoryConfig = (item) => {
    // Lấy tên rác, chuyển về chữ thường để so sánh chính xác
    const name = item.name ? item.name.toLowerCase() : "";
    const type = item.collectionPointType ? item.collectionPointType.toLowerCase() : "";

    // -- NHÓM 1: HỮU CƠ (Xanh lá) --
    if (name.includes("hữu cơ") || name.includes("thực phẩm") || type === "organic") {
      return { style: styles.organicWaste, icon: "leaf", iconColor: "#2E7D32" };
    }

    // -- NHÓM 2: NHỰA / TÁI CHẾ (Xanh dương) --
    if (name.includes("nhựa") || name.includes("tái chế") || type === "plastic") {
      return { style: styles.recycleWaste, icon: "recycle", iconColor: "#1976D2" };
    }

    // -- NHÓM 3: NGUY HẠI / PIN (Cam) --
    if (name.includes("nguy hại") || name.includes("pin") || name.includes("hóa chất") || type === "hazardous") {
      return { style: styles.hazardousWaste, icon: "alert", iconColor: "#F57C00" };
    }

    // -- NHÓM 4: ĐIỆN TỬ (Tím) --
    if (name.includes("điện tử") || name.includes("máy tính") || name.includes("điện thoại") || type === "electronic") {
      return { style: styles.electronicWaste, icon: "laptop", iconColor: "#512DA8" };
    }

    // -- NHÓM 5: THỦY TINH (Xanh ngọc/Vàng nhạt) --
    if (name.includes("thủy tinh") || name.includes("kính") || name.includes("chai lọ") || type === "glass") {
      return { style: styles.glassWaste, icon: "glass-cocktail", iconColor: "#0097A7" };
    }

    // -- NHÓM 6: GIẤY (Nâu nhạt) --
    if (name.includes("giấy") || name.includes("sách báo") || name.includes("carton") || type === "paper") {
      return { style: styles.paperWaste, icon: "newspaper", iconColor: "#5D4037" };
    }

    // -- NHÓM 7: KIM LOẠI (Xám xanh) --
    if (name.includes("kim loại") || name.includes("sắt") || name.includes("nhôm") || type === "metal") {
      return { style: styles.metalWaste, icon: "screw-machine-flat-top", iconColor: "#455A64" };
    }

    // -- NHÓM 8: Y TẾ (Hồng/Đỏ nhạt) --
    if (name.includes("y tế") || name.includes("thuốc") || name.includes("bệnh viện") || type === "medical") {
      return { style: styles.medicalWaste, icon: "medical-bag", iconColor: "#C2185B" };
    }

    // -- NHÓM 9: XÂY DỰNG (Xám nâu) --
    if (name.includes("xây dựng") || name.includes("gạch") || name.includes("đá")) {
      return { style: styles.constructionWaste, icon: "wall", iconColor: "#795548" };
    }

    // Mặc định (Rác khác)
    return { style: styles.defaultWaste, icon: "trash-can-outline", iconColor: "#757575" };
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tái chế</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Chọn loại rác</Text>
          <Text style={styles.subtitle}>
            Chọn loại rác bạn muốn xử lí để nhận hướng dẫn chi tiết
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {categories.map((item) => {
              const config = getCategoryConfig(item);
              
              return (
                <TouchableOpacity
                  key={item.id || Math.random().toString()}
                  style={[styles.wasteCard, config.style]}
                  onPress={() =>
                    router.push({
                      pathname: "/recycle-guide",
                      params: { 
                        data: JSON.stringify(item),
                        uiConfig: JSON.stringify(config) // Truyền config UI sang trang sau
                      },
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name={config.icon}
                    size={40}
                    color={config.iconColor}
                  />
                  <Text style={styles.wasteTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.wasteSubtitle} numberOfLines={2}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Footer Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/recycle-search")}
          >
            <MaterialCommunityIcons name="magnify" size={20} color="#0A0A0A" />
            <Text style={styles.actionButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/recycle-camera")}
          >
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
  centerContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
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
    width: "47%", // Chia đôi màn hình
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
    marginBottom: 12, 
  },
  
  // --- BẢNG MÀU PASTEL CHUẨN ---
  organicWaste: { backgroundColor: "#E8F5E9" },    // Xanh lá
  recycleWaste: { backgroundColor: "#E3F2FD" },    // Xanh dương
  hazardousWaste: { backgroundColor: "#FFF3E0" },  // Cam
  electronicWaste: { backgroundColor: "#EDE7F6" }, // Tím
  glassWaste: { backgroundColor: "#E0F7FA" },      // Xanh ngọc
  paperWaste: { backgroundColor: "#EFEBE9" },      // Nâu nhạt
  metalWaste: { backgroundColor: "#ECEFF1" },      // Xám xanh
  medicalWaste: { backgroundColor: "#FCE4EC" },    // Hồng (Y tế)
  constructionWaste: { backgroundColor: "#D7CCC8" }, // Nâu đất (Xây dựng)
  defaultWaste: { backgroundColor: "#ffffffff" },    // Mặc định

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