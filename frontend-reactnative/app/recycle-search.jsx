import React, { useState } from "react";
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Text
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import typography from "../styles/typography";
// Import API
import { searchCategories, classifyWasteByText } from "../src/services/categoryService";
import { addRecyclePoints } from "../src/services/userService"; // <--- ĐÃ THÊM

const RecycleSearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const quickFilters = [
    { id: 1, label: "Chai nhựa" },
    { id: 2, label: "Hộp giấy" },
    { id: 3, label: "Pin cũ" },
    { id: 4, label: "Túi ni lông" },
  ];

  // --- LOGIC GỌI AI ---
  const handleSearch = async (query) => {
    const textToSearch = query || searchQuery;
    if (!textToSearch.trim()) return;

    setLoading(true);
    try {
        // 1. Tìm trong danh sách có sẵn
        let results = await searchCategories(textToSearch);
        
        let targetItem;
        if (results && results.length > 0) {
            targetItem = results[0]; // Lấy kết quả đầu tiên
        } else {
            // 2. Nếu không có, hỏi AI phân tích trực tiếp
            targetItem = await classifyWasteByText(textToSearch);
        }

        if (targetItem && targetItem.name !== "Không xác định") {
            // *** CỘNG ĐIỂM (FR-9.1.1) ***
            try {
                await addRecyclePoints(); 
                console.log("Đã cộng 10 điểm cho người dùng.");
            } catch (pointError) {
                console.error("Lỗi cộng điểm:", pointError);
            }
            // ****************************
            
            // Chuyển sang trang chi tiết với dữ liệu từ AI
            router.push({
                pathname: "/recycle-guide",
                params: { data: JSON.stringify(targetItem) }
            });
        } else {
            alert("AI không tìm thấy thông tin phù hợp. Hãy thử từ khóa khác.");
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={{marginTop: 10, color: '#333'}}>AI đang tìm kiếm...</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0A0A0A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Tìm kiếm AI</Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập tên rác (vd: hộp xốp, pin...)"
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch()} // Gọi AI khi nhấn Enter
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
        <View style={styles.filtersContainer}>
          {quickFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={styles.filterChip}
              activeOpacity={0.7}
              onPress={() => handleSearch(filter.label)} // Gọi AI khi chọn Filter
            >
              <Text style={styles.filterText}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.cameraButton}
          activeOpacity={0.9}
          onPress={() => router.push("/recycle-camera")}
        >
          <MaterialCommunityIcons name="camera" size={20} color="#0A0A0A" />
          <Text style={styles.cameraButtonText}>Không thấy? Thử chụp ảnh</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFED" },
  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#F0EFED" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  scrollView: { flex: 1 },
  pageTitle: { ...typography.h1, fontSize: 28, fontWeight: "700", color: "#0A0A0A", paddingHorizontal: 24, marginBottom: 20 },
  searchContainer: { paddingHorizontal: 24, marginBottom: 24 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 12 },
  searchInput: { flex: 1, ...typography.body, fontSize: 15, color: "#0A0A0A", padding: 0 },
  sectionTitle: { ...typography.h3, fontSize: 16, fontWeight: "600", color: "#0A0A0A", paddingHorizontal: 24, marginBottom: 12 },
  filtersContainer: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 24, gap: 8, marginBottom: 28 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E0E0E0" },
  filterText: { ...typography.body, fontSize: 14, fontWeight: "500", color: "#0A0A0A" },
  cameraButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", marginHorizontal: 24, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0", gap: 8 },
  cameraButtonText: { ...typography.body, fontSize: 15, fontWeight: "600", color: "#0A0A0A" },
  bottomPadding: { height: 40 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }
});

export default RecycleSearchScreen;