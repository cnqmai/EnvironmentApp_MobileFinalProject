import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, FlatList, View, Text, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import AQICard from "../../components/AQICard";
import typography from "../../styles/typography";

// Import Service lấy dữ liệu
import { getAqiForSavedLocations } from "../../src/services/aqiService";


// --- HÀM DUY NHẤT CẦN DÙNG (Dịch trạng thái) ---
const getVietnameseAqiStatus = (aqiValue) => {
    if (aqiValue === null || isNaN(aqiValue) || aqiValue < 0) return "Không rõ";
    
    if (aqiValue >= 301) return "Nguy hiểm";
    if (aqiValue >= 201) return "Rất không tốt";
    if (aqiValue >= 151) return "Không lành mạnh";
    if (aqiValue >= 101) return "Không tốt cho nhóm nhạy cảm";
    if (aqiValue >= 51) return "Trung bình";
    if (aqiValue >= 0) return "Tốt";
    
    return "Không rõ";
};
// ----------------------------------------------------------------------------------


const DashboardScreen = () => {
  const router = useRouter();
  
  const [aqiList, setAqiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      // Backend đã tính toán AQI 0-500 và gửi về
      const data = await getAqiForSavedLocations(); 
      const formattedData = data.map((item, index) => {
        
        // --- CHỈ LẤY GIÁ TRỊ VÀ DỊCH TRẠNG THÁI ---
        const calculatedAqi = item.aqiValue; 

        return ({
          id: item.locationId ? item.locationId.toString() : `default-${index}`,
          location: { 
              name: item.locationName || "Vị trí chưa đặt tên", 
              city: item.resolvedCityName || "" 
          },
          aqi: calculatedAqi,
          status: getVietnameseAqiStatus(calculatedAqi), 
          description: item.healthAdvisory,
          isSensitiveGroup: calculatedAqi > 100, 
        })
      });

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

  // --- PHẦN HEADER VÀ UI DƯỚI GIỮ NGUYÊN ---
  const DashboardHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <View style={styles.featuresContainer}>
        <TouchableOpacity style={styles.tipCard} onPress={() => router.push('/features/daily-tip')} activeOpacity={0.9}>
          <View style={styles.tipIconBox}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#FFF" />
          </View>
          <View style={styles.tipContent}>
              <Text style={styles.tipLabel}>Mẹo hôm nay</Text>
              <Text style={styles.tipTitle}>Mang túi vải đi chợ</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#004D40" />
        </TouchableOpacity>

        <View style={styles.rowButtons}>
            <TouchableOpacity style={[styles.featureBtn, { backgroundColor: '#E0F2F1' }]} onPress={() => router.push('/features/quiz')}>
                <MaterialCommunityIcons name="gamepad-variant-outline" size={28} color="#00695C" />
                <Text style={styles.featureBtnText}>Mini Quiz</Text>
                <Text style={styles.featureBtnSub}>Kiếm điểm thưởng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featureBtn, { backgroundColor: '#E3F2FD' }]} onPress={() => router.push('/features/knowledge')}>
                <MaterialCommunityIcons name="book-open-page-variant-outline" size={28} color="#0277BD" />
                <Text style={styles.featureBtnText}>Thư viện</Text>
                <Text style={styles.featureBtnSub}>Kiến thức xanh</Text>
            </TouchableOpacity>
        </View>

      </View>

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
        ListHeaderComponent={DashboardHeader} 
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
      flex: 1, 
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10, 
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
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
    elevation: 2, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB300', 
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
    fontSize: 22, 
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
      fontSize: 18,
      color: '#333',
      marginBottom: 8
  },
  emptySubText: {
      fontSize: 15,
      color: '#999',
      textAlign: 'center'
  }
});

export default DashboardScreen;