import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, FlatList, View, Text, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from 'expo-location';

// Components
import AQICard from "../../components/AQICard";
import typography from "../../styles/typography";

// Services
import { getAqiByGps, getAqiForSavedLocations } from "../../src/services/aqiService";
import { getToken } from "../../src/utils/apiHelper";

const DashboardScreen = () => {
  const router = useRouter();
  const [aqiList, setAqiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm lấy dữ liệu
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];

      // 1. Lấy vị trí hiện tại và AQI tại đó
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        try {
          const currentAqi = await getAqiByGps(location.coords.latitude, location.coords.longitude);
          // Format dữ liệu cho khớp với AQICard
          if (currentAqi) {
             data.push({
              id: 'current',
              location: { name: "Vị trí hiện tại", city: "" },
              aqi: currentAqi.aqi,
              status: currentAqi.level, // Ví dụ: "Tốt", "Kém"
              description: currentAqi.recommendation,
              isSensitiveGroup: currentAqi.aqi > 100,
            });
          }
        } catch (e) {
          console.log("Lỗi lấy AQI GPS:", e);
        }
      }

      // 2. Lấy AQI từ các địa điểm đã lưu (nếu đã đăng nhập)
      const token = await getToken();
      if (token) {
        try {
          const savedLocations = await getAqiForSavedLocations();
          const formattedSaved = savedLocations.map((item, index) => ({
            id: `saved-${index}`,
            location: { name: item.name, city: "" }, // Backend trả về tên địa điểm
            aqi: item.aqi,
            status: item.level,
            description: item.recommendation,
            isSensitiveGroup: item.aqi > 100,
          }));
          data = [...data, ...formattedSaved];
        } catch (e) {
          console.log("Chưa đăng nhập hoặc lỗi lấy địa điểm đã lưu");
        }
      }

      setAqiList(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu chất lượng không khí.");
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

  const renderAQICard = useCallback(
    ({ item }) => (
      <AQICard
        location={item.location}
        aqi={item.aqi}
        description={item.description}
        isSensitiveGroup={item.isSensitiveGroup}
        onPress={() =>
          router.push({
            pathname: "/detail",
            params: {
              locationName: item.location.name,
              locationCity: item.location.city,
              aqi: item.aqi,
              isSensitiveGroup: item.isSensitiveGroup,
            },
          })
        }
      />
    ),
    [router]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <Text style={styles.dashboardTitle}>AQI khu vực của tôi</Text>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={aqiList}
          renderItem={renderAQICard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          style={styles.flatListStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
              Chưa có dữ liệu. Hãy bật GPS hoặc thêm địa điểm.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
    position: "relative",
  },
  centerContainer: {
    flex: 1,
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
});

export default DashboardScreen;