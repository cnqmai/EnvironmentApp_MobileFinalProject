import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, FlatList, View, Text, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // CẦN THÊM: Icon
import AQICard from "../../components/AQICard";
import typography from "../../styles/typography";

// Import Service lấy dữ liệu
import { getAqiForSavedLocations } from "../../src/services/aqiService";

const DashboardScreen = () => {
  const router = useRouter();
  
  // States quản lý dữ liệu và trạng thái tải
  const [aqiList, setAqiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      const data = await getAqiForSavedLocations();
      
      const formattedData = data.map((item, index) => ({
        id: item.locationId ? item.locationId.toString() : `default-${index}`,
        location: { 
            name: item.locationName || "Vị trí chưa đặt tên", 
            city: item.resolvedCityName || "" 
        },
        aqi: item.aqiValue,
        status: translateStatus(item.status),
        description: item.healthAdvisory,
        isSensitiveGroup: item.aqiValue > 100, 
      }));

      setAqiList(formattedData);
    } catch (error) {
      // console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const translateStatus = (status) => {
      const map = { "Good": "Tốt", "Fair": "Khá", "Moderate": "Trung bình", "Poor": "Kém", "Very Poor": "Rất kém", "Unknown": "Không rõ" };
      return map[status] || status;
  };

  const renderAQICard = useCallback(({ item }) => (
      <AQICard
        location={item.location}
        aqi={item.aqi}
        description={item.description}
        isSensitiveGroup={item.isSensitiveGroup}
        onPress={() => router.push({
            pathname: "/detail",
            params: {
              locationName: item.location.name,
              locationCity: item.location.city,
              aqi: item.aqi,
              status: item.status,
              description: item.description,
              isSensitiveGroup: item.isSensitiveGroup.toString(),
            },
          })
        }
      />
    ), [router]);

  // --- PHẦN MỚI: HEADER CHỨA CÁC NÚT ĐIỀU HƯỚNG ---
  const DashboardHeader = () => (
    <View>
      {/* 1. Header Title Gốc */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* 2. KHU VỰC TÍNH NĂNG MỚI (SHORTCUTS) */}
      <View style={styles.featuresContainer}>
        
        {/* Card to: Mẹo sống xanh */}
        <TouchableOpacity 
          style={styles.tipCard}
          onPress={() => router.push('/features/daily-tip')}
          activeOpacity={0.9}
        >
          <View style={styles.tipIconBox}>
             <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#FFF" />
          </View>
          <View style={styles.tipContent}>
             <Text style={styles.tipLabel}>Mẹo hôm nay</Text>
             <Text style={styles.tipTitle}>Mang túi vải đi chợ</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#004D40" />
        </TouchableOpacity>

        {/* Hàng 2 nút: Quiz & Thư viện */}
        <View style={styles.rowButtons}>
            <TouchableOpacity 
                style={[styles.featureBtn, { backgroundColor: '#E0F2F1' }]} // Màu xanh nhạt
                onPress={() => router.push('/features/quiz')}
            >
                <MaterialCommunityIcons name="gamepad-variant-outline" size={28} color="#00695C" />
                <Text style={styles.featureBtnText}>Mini Quiz</Text>
                <Text style={styles.featureBtnSub}>Kiếm điểm thưởng</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.featureBtn, { backgroundColor: '#E3F2FD' }]} // Màu xanh dương nhạt
                onPress={() => router.push('/features/knowledge')}
            >
                <MaterialCommunityIcons name="book-open-page-variant-outline" size={28} color="#0277BD" />
                <Text style={styles.featureBtnText}>Thư viện</Text>
                <Text style={styles.featureBtnSub}>Kiến thức xanh</Text>
            </TouchableOpacity>
        </View>

      </View>

      {/* 3. Title AQI cũ */}
      <Text style={styles.dashboardTitle}>AQI khu vực của tôi</Text>
    </View>
  );

  if (loading && !refreshing) {
      return (
          <SafeAreaView style={[styles.container, styles.centerContent]}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{marginTop: 10, color: "#666"}}>Đang cập nhật dữ liệu AQI...</Text>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={aqiList}
        renderItem={renderAQICard}
        keyExtractor={(item) => item.id}
        // --- TÍCH HỢP HEADER VÀO ĐÂY ---
        ListHeaderComponent={DashboardHeader} 
        // -------------------------------
        contentContainerStyle={styles.listContent}
        style={styles.flatListStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
        ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có địa điểm nào được lưu.</Text>
                <Text style={styles.emptySubText}>Hãy cập nhật hồ sơ hoặc thêm địa điểm mới.</Text>
            </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1, // Fix loading layout
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10, // Giảm padding bottom để gom nhóm đẹp hơn
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 24, // Tăng size một chút cho nổi bật
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  // --- STYLES MỚI CHO CÁC NÚT TÍNH NĂNG ---
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB300', // Màu vàng cho bóng đèn
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tipTitle: {
    fontSize: 16,
    color: '#0A0A0A',
    fontWeight: 'bold',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    elevation: 2, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featureBtnText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0A0A',
  },
  featureBtnSub: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  dashboardTitle: {
    ...typography.h1,
    fontSize: 22, // Giảm size một chút cho cân đối với header trên
    fontWeight: "800",
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 16,
    color: "#0A0A0A",
  },
  flatListStyle: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 30,
      paddingHorizontal: 20
  },
  emptyText: {
      ...typography.h3,
      color: '#333',
      marginBottom: 8
  },
  emptySubText: {
      ...typography.body,
      color: '#999',
      textAlign: 'center'
  }
});

export default DashboardScreen;