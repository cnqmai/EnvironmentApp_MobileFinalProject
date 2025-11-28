import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, FlatList, View, Text, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
      
      // Ánh xạ dữ liệu từ Backend (SavedLocationAqiResponse) sang format của UI
      const formattedData = data.map((item, index) => ({
        id: item.locationId ? item.locationId.toString() : `default-${index}`,
        location: { 
            // Ưu tiên lấy tên thành phố đã phân giải, nếu không có thì lấy tên đặt
            name: item.locationName || "Vị trí chưa đặt tên", 
            city: item.resolvedCityName || "" 
        },
        aqi: item.aqiValue,
        status: translateStatus(item.status), // Chuyển đổi trạng thái sang tiếng Việt
        description: item.healthAdvisory,
        // Logic xác định nhóm nhạy cảm (Ví dụ: AQI > 100 là có hại cho nhóm nhạy cảm)
        isSensitiveGroup: item.aqiValue > 100, 
      }));

      setAqiList(formattedData);
    } catch (error) {
      //console.error("Lỗi tải dashboard:", error);
      // Có thể thêm Toast hoặc Alert báo lỗi tại đây
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Gọi dữ liệu khi mở màn hình
  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý khi người dùng kéo xuống để làm mới
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Helper: Dịch trạng thái AQI sang tiếng Việt
  const translateStatus = (status) => {
      const map = {
          "Good": "Tốt",
          "Fair": "Khá",
          "Moderate": "Trung bình",
          "Poor": "Kém",
          "Very Poor": "Rất kém",
          "Unknown": "Không rõ"
      };
      return map[status] || status;
  };

  const renderAQICard = useCallback(
    ({ item }) => (
      <AQICard
        location={item.location}
        aqi={item.aqi}
        description={item.description}
        isSensitiveGroup={item.isSensitiveGroup}
        // Khi bấm vào card, chuyển sang trang chi tiết kèm dữ liệu
        onPress={() =>
          router.push({
            pathname: "/detail",
            params: {
              locationName: item.location.name,
              locationCity: item.location.city,
              aqi: item.aqi,
              status: item.status,
              description: item.description,
              isSensitiveGroup: item.isSensitiveGroup.toString(), // Params nên là string
            },
          })
        }
      />
    ),
    [router]
  );

  // Hiển thị màn hình loading khi đang tải lần đầu
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <Text style={styles.dashboardTitle}>AQI khu vực của tôi</Text>

      <FlatList
        data={aqiList}
        renderItem={renderAQICard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.flatListStyle}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={3}
        keyboardShouldPersistTaps="handled"
        // Thêm RefreshControl
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
        // Hiển thị khi danh sách trống
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
    position: "relative",
  },
  centerContent: {
      justifyContent: 'center',
      alignItems: 'center'
  },
  header: {
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 0,
    zIndex: 2,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  dashboardTitle: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: "900",
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    color: "#0A0A0A",
    letterSpacing: -0.8,
    lineHeight: 42,
    zIndex: 1,
  },
  flatListStyle: {
    flex: 1,
    zIndex: 0,
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 16,
    paddingHorizontal: 4,
    flexGrow: 1,
    minHeight: 200,
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 50,
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