import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import typography, { FONT_FAMILY } from "../styles/typography";
import { getCollectionPoints } from "../src/services/mapService"; 

const RecycleGuideScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [wasteData, setWasteData] = useState(null);
  const [nearestPoint, setNearestPoint] = useState(null);
  const [uiConfig, setUiConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(null);

  useEffect(() => {
    const initData = async () => {
      if (params.data) {
        try {
          const parsedData = JSON.parse(params.data);
          setWasteData(parsedData);

          // 1. Lấy UI Config từ params (nếu có)
          if (params.uiConfig) {
            setUiConfig(JSON.parse(params.uiConfig));
          }

          // 2. Xin quyền truy cập vị trí
          let { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status);
          
          if (status !== 'granted') {
            Alert.alert('Quyền bị từ chối', 'Cần quyền vị trí để tìm điểm thu gom gần bạn.');
            setLoading(false);
            return;
          }

          // 3. Lấy vị trí hiện tại
          let currentLocation = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = currentLocation.coords;

          // 4. Gọi API tìm điểm thu gom gần nhất
          // Map loại rác từ DB sang loại điểm thu gom (nếu cần thiết)
          // Ở đây giả sử collectionPointType trong waste_categories khớp với type trong waste_collection_points
          const wasteType = parsedData.collectionPointType; 
          
          // Gọi API thực tế
          const points = await getCollectionPoints(latitude, longitude, wasteType);

          if (points && points.length > 0) {
            // Giả sử API trả về danh sách đã được sắp xếp theo khoảng cách
            // Lấy điểm gần nhất
            setNearestPoint(points[0]);
          }

        } catch (e) {
          console.error("Lỗi khởi tạo dữ liệu hướng dẫn:", e);
          // Có thể setNearestPoint(null) hoặc xử lý lỗi khác tùy ý
        } finally {
          setLoading(false);
        }
      }
    };

    initData();
  }, [params.data]);

  // Cấu hình mặc định nếu không có UI config
  const defaultConfig = { color: "#616161", bg: "#F5F5F5", icon: "trash-can-outline", title: "Chi tiết rác thải" };
  const config = uiConfig || defaultConfig;

  // Xử lý văn bản hướng dẫn: Tách các bước
  const steps = wasteData?.disposalGuideline 
    ? wasteData.disposalGuideline.split(/\.\s+|\n/).filter(s => s.trim().length > 0)
    : ["Thu gom gọn gàng.", "Bỏ đúng nơi quy định."];

  // Xử lý mở bản đồ
  const handleOpenMap = () => {
      if (nearestPoint) {
          const lat = nearestPoint.latitude;
          const lon = nearestPoint.longitude;
          const label = encodeURIComponent(nearestPoint.name);
          
          // Tạo URL scheme cho bản đồ
          const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
          const latLng = `${lat},${lon}`;
          const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
          });
          
          Linking.openURL(url);
      } else {
          // Nếu không có điểm thu gom cụ thể, mở trang bản đồ chung của app
          router.push('/map'); 
      }
  };

  if (!wasteData) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Kết quả phân loại</Text>

        {/* 1. RESULT CARD */}
        <View style={[styles.resultCard, { backgroundColor: config.style?.backgroundColor || config.bg }]}>
          <View style={styles.iconCircle}>
             <MaterialCommunityIcons 
                name={config.icon} 
                size={40} 
                color={config.iconColor || config.color} 
             />
          </View>
          <View style={styles.resultTextContainer}>
            <Text style={[styles.resultTitle, { color: config.iconColor || config.color }]}>
                {wasteData.name}
            </Text>
            <Text style={styles.resultSubtitle}>{wasteData.description}</Text>
          </View>
        </View>

        {/* 2. HƯỚNG DẪN XỬ LÝ */}
        <Text style={styles.sectionTitle}>Hướng dẫn xử lí</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: config.iconColor || config.color }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step.trim()}</Text>
            </View>
          ))}
        </View>

        {/* 3. MẸO TÁI CHẾ */}
        <Text style={styles.sectionTitle}>Mẹo tái chế</Text>
        {wasteData.recyclingGuideline && (
            <View style={styles.tipCard}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#1976D2" style={{marginRight: 10}} />
                <Text style={styles.tipText}>
                    {wasteData.recyclingGuideline}
                </Text>
            </View>
        )}

        {/* 4. ĐIỂM THU GOM GẦN NHẤT (Dữ liệu thực tế từ API) */}
        <Text style={styles.sectionTitle}>Điểm thu gom gần nhất</Text>
        
        {loading ? (
           <ActivityIndicator size="small" color="#4CAF50" style={{alignSelf: 'flex-start', marginLeft: 20, marginBottom: 20}} />
        ) : nearestPoint ? (
            <View style={styles.locationCard}>
                <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={28} color="#0A0A0A" style={{marginTop: 2}} />
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>{nearestPoint.name}</Text>
                        <Text style={styles.locationAddress}>{nearestPoint.address}</Text>
                        <Text style={styles.locationHours}>
                            Mở cửa: <Text style={{color: '#2E7D32', fontWeight: 'bold'}}>{nearestPoint.opening_hours || "Giờ hành chính"}</Text>
                        </Text>
                    </View>
                    {/* Hiển thị khoảng cách nếu API trả về */}
                    {nearestPoint.distance !== undefined && (
                      <View style={styles.distanceBadge}>
                          <Text style={styles.distanceText}>
                            {typeof nearestPoint.distance === 'number' 
                              ? `${nearestPoint.distance.toFixed(1)} km` 
                              : nearestPoint.distance}
                          </Text>
                      </View>
                    )}
                </View>
            </View>
        ) : (
            <Text style={{color: '#666', fontStyle: 'italic', marginBottom: 20, paddingHorizontal: 4}}>
              {locationPermission !== 'granted' 
                ? "Vui lòng cấp quyền vị trí để tìm điểm thu gom." 
                : "Không tìm thấy điểm thu gom phù hợp gần đây."}
            </Text>
        )}

        {/* 5. NÚT XEM BẢN ĐỒ */}
        <TouchableOpacity 
            style={styles.mapButton}
            onPress={handleOpenMap}
        >
            <Text style={styles.mapButtonText}>Xem bản đồ</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9", 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: "bold",
    color: "#0A0A0A",
    marginBottom: 24,
    marginTop: 10,
  },
  
  // RESULT CARD
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultSubtitle: {
    ...typography.body,
    fontSize: 15,
    color: "#333",
    opacity: 0.9,
  },

  // SECTION TITLE
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 16,
  },

  // STEPS
  stepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "flex-start",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepText: {
    ...typography.body,
    fontSize: 15,
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },

  // TIP CARD
  tipCard: {
      flexDirection: 'row',
      backgroundColor: '#E3F2FD',
      padding: 16,
      borderRadius: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#BBDEFB',
      alignItems: 'center'
  },
  tipText: {
      flex: 1,
      fontSize: 14,
      color: '#0D47A1',
      lineHeight: 20
  },

  // LOCATION CARD
  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  locationHours: {
    fontSize: 13,
    color: "#666",
  },
  distanceBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0A0A0A",
  },

  // MAP BUTTON
  mapButton: {
    backgroundColor: "#000000",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  mapButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RecycleGuideScreen;