import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import typography from "../../styles/typography";
import { getAllCategories } from "../../src/services/categoryService"; 

const RecycleScreen = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getCategoryStyle = (type) => {
    switch (type) {
      case "ORGANIC": return { icon: "leaf", color: "#2E7D32", bg: "#E8F5E9" };
      case "PLASTIC": return { icon: "recycle", color: "#1976D2", bg: "#E3F2FD" };
      case "ELECTRONIC": return { icon: "laptop", color: "#512DA8", bg: "#EDE7F6" };
      case "PAPER": return { icon: "newspaper", color: "#795548", bg: "#EFEBE9" };
      case "METAL": return { icon: "screw-machine-flat-top", color: "#607D8B", bg: "#ECEFF1" };
      case "GLASS": return { icon: "cup", color: "#0097A7", bg: "#E0F7FA" };
      case "HAZARDOUS": return { icon: "alert", color: "#F57C00", bg: "#FFF3E0" };
      default: return { icon: "trash-can-outline", color: "#757575", bg: "#F5F5F5" };
    }
  };

  const renderItem = ({ item }) => {
    const style = getCategoryStyle(item.collectionPointType);
    return (
      <TouchableOpacity
        style={[styles.wasteCard, { backgroundColor: style.bg }]}
        onPress={() => router.push({ pathname: "/recycle-guide", params: { data: JSON.stringify(item) } })}
      >
        <MaterialCommunityIcons name={style.icon} size={40} color={style.color} />
        <Text style={styles.wasteTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.wasteSubtitle} numberOfLines={1}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  // Header của danh sách (Tiêu đề)
  const renderHeader = () => (
    <View style={styles.titleSection}>
      <Text style={styles.title}>Chọn loại rác</Text>
      <Text style={styles.subtitle}>Chọn loại rác bạn muốn xử lí để nhận hướng dẫn chi tiết</Text>
    </View>
  );

  // Footer của danh sách (Các nút hành động) - Đặt ở đây để nó cuộn theo nội dung
  const renderFooter = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/recycle-search")}>
        <MaterialCommunityIcons name="magnify" size={20} color="#0A0A0A" />
        <Text style={styles.actionButtonText}>Tìm kiếm</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/recycle-camera")}>
        <MaterialCommunityIcons name="camera" size={20} color="#0A0A0A" />
        <Text style={styles.actionButtonText}>Chụp ảnh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tái chế</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color="#4CAF50" /></View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFED" },
  header: { backgroundColor: "#F0EFED", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { ...typography.h2, fontSize: 20, fontWeight: "700", color: "#0A0A0A", letterSpacing: -0.3 },
  titleSection: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  title: { ...typography.h2, fontSize: 20, fontWeight: "bold", color: "#0A0A0A", marginBottom: 8 },
  subtitle: { ...typography.body, fontSize: 14, color: "#666", lineHeight: 20 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 12 },
  wasteCard: { width: "48%", borderRadius: 20, padding: 20, alignItems: "center", justifyContent: "center", minHeight: 140, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  wasteTitle: { ...typography.h3, fontSize: 16, fontWeight: "bold", color: "#0A0A0A", marginTop: 12, marginBottom: 4, textAlign: "center" },
  wasteSubtitle: { ...typography.small, fontSize: 12, color: "#666", textAlign: "center" },
  actionButtons: { flexDirection: "row", paddingHorizontal: 8, paddingTop: 24, gap: 12, marginBottom: 40 },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, gap: 8, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  actionButtonText: { ...typography.body, fontSize: 14, fontWeight: "600", color: "#0A0A0A" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" }
});

export default RecycleScreen;