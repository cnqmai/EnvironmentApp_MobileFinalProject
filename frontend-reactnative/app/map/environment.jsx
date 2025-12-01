import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import * as Location from 'expo-location';
import { getAqiColor, getAqiStatusText } from '../../src/utils/aqiUtils';
import { API_BASE_URL } from '../../src/constants/api';
import { getPrivacySettings } from '../../src/services/userService';

// Khai báo lại BASE_URL
const BASE_URL = API_BASE_URL;
// Tách BASE_URL thành domain gốc cho các API không bắt đầu bằng /api/
const BASE_BASE = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

// DÙNG TỌA ĐỘ MẶC ĐỊNH NẾU KHÔNG CÓ GPS (TP. HCM)
const DEFAULT_LAT = 10.762622;
const DEFAULT_LON = 106.660172;

// Lấy vị trí GPS thực tế
const getUserLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    console.error('Permission to access location was denied');
    // Trả về cờ hasPermission: false
    return { lat: DEFAULT_LAT, lon: DEFAULT_LON, hasPermission: false };
  }

  try {
    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    // Trả về cờ hasPermission: true
    return { lat: location.coords.latitude, lon: location.coords.longitude, hasPermission: true };
  } catch (error) {
    console.error("Lỗi khi lấy vị trí GPS:", error);
    return { lat: DEFAULT_LAT, lon: DEFAULT_LON, hasPermission: false };
  }
};


const EnvironmentDataScreen = () => {
  const router = useRouter();

  // State vị trí hiện tại (GPS)
  const [currentAqi, setCurrentAqi] = useState(null);
  const [currentNoise, setCurrentNoise] = useState(null);
  const [currentWater, setCurrentWater] = useState(null);

  // State tìm kiếm
  const [searchAddress, setSearchAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [customAreas, setCustomAreas] = useState([]);

  // State chung
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState(null);
  const [isLocationShared, setIsLocationShared] = useState(true);

  // --- LOGIC GỢI Ý TÌM KIẾM ---
  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      // Thêm timeout cho request tìm kiếm
      const response = await axios.get(`${BASE_BASE}/environmental-data/search-address`, {
        params: { query: query, limit: 5 },
        timeout: 8000
      });
      setSuggestions(response.data);
    } catch (e) {
      console.error("Lỗi lấy gợi ý:", e);
      setSuggestions([]);
    }
  };

  const handleSearchChange = (text) => {
    setSearchAddress(text);
    fetchSuggestions(text);
  };

  const handleSelectSuggestion = async (suggestion) => {
    Keyboard.dismiss();
    setSuggestions([]);
    const fullName = `${suggestion.name}, ${suggestion.state ? suggestion.state + ', ' : ''}${suggestion.country}`;
    setSearchAddress(fullName);

    setSearchLoading(true);
    try {
      const newArea = await fetchAreaDetails(suggestion.lat, suggestion.lon, fullName);
      setCustomAreas(prev => [newArea, ...prev]);
      setSearchAddress('');
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lấy dữ liệu môi trường cho vị trí này.");
    } finally {
      setSearchLoading(false);
    }
  };


  // --- HÀM 1: LẤY DỮ LIỆU VỊ TRÍ HIỆN TẠI (GPS) ---
  const fetchCurrentLocationData = async () => {
    try {
      setLoading(true);

      // 1. Lấy cài đặt Quyền riêng tư (BACKEND)
      const privacyRes = await getPrivacySettings();
      setPrivacySettings(privacyRes);

      // FIX: Đồng bộ key với CreateReport
      const isSharedInBackend = privacyRes.share_location;
      setIsLocationShared(isSharedInBackend);

      let finalLat = DEFAULT_LAT;
      let finalLon = DEFAULT_LON;
      let showWarning = false;

      // 2. LOGIC XÁC ĐỊNH TỌA ĐỘ CUỐI CÙNG
      if (isSharedInBackend) {
        const userLoc = await getUserLocation();
        if (userLoc.hasPermission) {
          // Ưu tiên 1: GPS thực + Quyền riêng tư BẬT
          finalLat = userLoc.lat;
          finalLon = userLoc.lon;
        } else {
          // Ưu tiên 2: Quyền riêng tư BẬT nhưng Quyền Hệ thống TẮT
          showWarning = true;
          setIsLocationShared(false);
        }
      } else {
        // Ưu tiên 3: Quyền riêng tư TẮT (luôn dùng mặc định)
        showWarning = true;
      }

      // 3. Gọi API với tọa độ đã được kiểm tra/mặc định (Thêm Timeout)
      const requestConfig = { params: { lat: finalLat, lon: finalLon }, timeout: 10000 };

      const aqiPromise = axios.get(`${BASE_URL}/aqi`, requestConfig).catch((e) => {
        console.error("AQI API Failed:", e.message);
        return null; // Trả về null khi lỗi
      });
      const noisePromise = axios.get(`${BASE_BASE}/environmental-data/noise`, requestConfig).catch((e) => {
        console.error("Noise API Failed:", e.message);
        return null;
      });
      const waterPromise = axios.get(`${BASE_BASE}/environmental-data/water`, requestConfig).catch((e) => {
        console.error("Water API Failed:", e.message);
        return null;
      });

      const [aqiRes, noiseRes, waterRes] = await Promise.all([aqiPromise, noisePromise, waterPromise]);

      // FIX: Chỉ set state nếu response trả về dữ liệu (không phải null)
      setCurrentAqi(aqiRes ? aqiRes.data : null);
      setCurrentNoise(noiseRes ? noiseRes.data : null);
      setCurrentWater(waterRes ? waterRes.data : null);

      // 4. Hiển thị cảnh báo UX nếu vị trí bị buộc về mặc định
      if (showWarning) {
        Alert.alert("Lưu ý", "Dữ liệu môi trường đang hiển thị cho vị trí chung vì bạn đã tắt 'Chia sẻ vị trí' trong Cài đặt Quyền riêng tư hoặc chưa cấp quyền GPS cho ứng dụng.");
      }

    } catch (e) {
      console.error("Lỗi khi lấy dữ liệu GPS/API:", e);
      setCurrentAqi(null);
      setCurrentNoise(null);
      setCurrentWater(null);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM 2: LẤY DỮ LIỆU CHO MỘT TỌA ĐỘ CỤ THỂ (Thêm Timeout) ---
  const fetchAreaDetails = async (lat, lon, name) => {
    try {
      const requestConfig = { params: { lat, lon }, timeout: 10000 };
      // Bọc riêng từng API call bằng .catch(() => null)
      const aqiPromise = axios.get(`${BASE_URL}/aqi`, requestConfig).catch(() => null);
      const noisePromise = axios.get(`${BASE_BASE}/environmental-data/noise`, requestConfig).catch(() => null);
      const waterPromise = axios.get(`${BASE_BASE}/environmental-data/water`, requestConfig).catch(() => null);

      const [aqiRes, noiseRes, waterRes] = await Promise.all([aqiPromise, noisePromise, waterPromise]);

      const aqiData = aqiRes ? aqiRes.data : null;

      // SỬA: Kiểm tra aqiData trước khi truy cập thuộc tính
      const aqiValue = aqiData?.calculatedAqiValue || 'N/A';
      const aqiStatus = aqiData ? getAqiStatusText(aqiValue) : 'Không có dữ liệu';


      return {
        name: name,
        lat: lat,
        lon: lon,
        aqi: aqiValue,
        noise: noiseRes?.data?.decibel || 'N/A', // Kiểm tra null an toàn
        water: (waterRes?.data?.mainIndexValue && waterRes.data.mainIndexValue.toFixed(1)) || 'N/A',
        aqiStatus: aqiStatus
      };
    } catch (e) {
      console.error(`Lỗi lấy dữ liệu cho ${name}:`, e);
      return { name: name, error: "Lỗi tải dữ liệu khu vực" };
    }
  };

  // --- HÀM 3: XỬ LÝ NÚT THÊM KHU VỰC ---
  const handleAddArea = async () => {
    if (!searchAddress.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ cần tìm kiếm.");
      return;
    }

    setSearchLoading(true);
    setSuggestions([]); // Đóng gợi ý khi nhấn Add
    try {
      // BƯỚC 1: Gọi API Geocoding backend để chuyển địa chỉ thành tọa độ
      const geocodeResponse = await axios.get(`${BASE_BASE}/environmental-data/geocode`, { // SỬA: Dùng BASE_BASE
        params: { address: searchAddress },
        timeout: 10000
      });

      const coords = geocodeResponse.data;

      if (!coords || !coords.lat || !coords.lon) {
        Alert.alert("Không tìm thấy", "Không tìm thấy tọa độ cho địa chỉ bạn nhập. Vui lòng nhập chi tiết hơn.");
        return;
      }

      // BƯỚC 2: Dùng tọa độ để lấy dữ liệu môi trường chi tiết
      const newArea = await fetchAreaDetails(coords.lat, coords.lon, searchAddress.trim());

      setCustomAreas(prev => [newArea, ...prev]);
      setSearchAddress('');

    } catch (e) {
      console.error("Lỗi xử lý tìm kiếm:", e);
      Alert.alert("Lỗi", "Không thể tìm kiếm hoặc lấy dữ liệu môi trường cho địa chỉ này.");
    } finally {
      setSearchLoading(false);
    }
  };

  // SỬA: Dùng useFocusEffect thay vì useEffect
  useFocusEffect(
    useCallback(() => {
      fetchCurrentLocationData();
      setSuggestions([]);
    }, [])
  );

  // FIX: Đảm bảo currentAqi không null trước khi dùng thuộc tính (ĐÃ SỬA)
  const aqiValue = currentAqi?.calculatedAqiValue !== undefined && currentAqi?.calculatedAqiValue !== null
    ? currentAqi.calculatedAqiValue
    : 'N/A';

  const aqiColor = getAqiColor(aqiValue);
  const healthAdvisory = currentAqi?.healthAdvisory || 'Chưa có khuyến cáo.';

  // MỚI: Màu sắc icon môi trường dựa trên cờ chia sẻ vị trí
  const environmentIconColor = aqiValue !== 'N/A' && isLocationShared
    ? getAqiColor(aqiValue)
    : '#808080';


  // Hàm render chung cho 2 Stat Card (ĐÃ SỬA LOGIC DÙNG DATA MỚI)
  const renderStatCard = (data, label, icon, unit) => {
    let value = 'N/A';
    let color = '#808080'; // Mặc định màu xám nếu không có dữ liệu

    // SỬA: Kiểm tra data trước khi truy cập
    if (data) {
      if (label === 'Tiếng ồn' && data.decibel !== undefined) {
        value = data.decibel;
        // Dùng logic màu sắc cũ (cần đảm bảo logic này đúng)
        color = data.decibel >= 80 ? '#FF0000' : (data.decibel >= 70 ? '#FF9900' : '#00C853');
      } else if (label === 'Chất lượng nước' && data.mainIndexValue !== undefined) {
        value = data.mainIndexValue.toFixed(1);
        // Dùng logic màu sắc cũ (cần đảm bảo logic này đúng)
        color = data.mainIndexValue >= 6.5 && data.mainIndexValue <= 8.5 ? '#00C853' : '#FF9900';
      }
    }

    return (
      <View style={styles.statCard}>
        <MaterialCommunityIcons name={icon} size={20} color={color} style={{ marginBottom: 5 }} />
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: color }]}>{value}{'\n'}{unit}</Text>
      </View>
    );
  };

  if (loading && !customAreas.length) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color="#00C853" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu vị trí hiện tại...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dữ liệu môi trường</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Main AQI Card (LẤY DỮ LIỆU TỪ GPS) */}
        <Text style={styles.currentLocationTitle}>Vị trí hiện tại ({isLocationShared ? 'GPS' : 'Mặc định'})</Text>
        <View style={[styles.mainCard, { backgroundColor: aqiColor }]}>
          <Text style={styles.mainTitle}>Chỉ số AQI tại {currentAqi?.city || (isLocationShared ? 'Vị trí của bạn' : 'Vị trí chung')}</Text>
          <Text style={styles.mainValue}>{aqiValue}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Chất lượng không khí: {getAqiStatusText(aqiValue)}</Text>
          </View>
          <Text style={styles.advisoryText}>{healthAdvisory}</Text>
          <MaterialCommunityIcons name="cloud-outline" size={150} color="rgba(255,255,255,0.1)" style={styles.bgIcon} />
        </View>

        {/* Small Stats Cards (Bỏ Nhiệt độ) */}
        <View style={styles.statsRow}>
          {renderStatCard(currentNoise, 'Tiếng ồn', 'volume-high', 'dBA')}
          {renderStatCard(currentWater, 'Chất lượng nước', 'water-percent', 'pH')}
        </View>

        {/* --- KHU VỰC TÌM KIẾM --- */}
        <Text style={styles.sectionTitle}>Tìm kiếm và Thêm khu vực</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập địa chỉ (Ví dụ: Quận 1, Hà Nội...)"
            value={searchAddress}
            onChangeText={handleSearchChange}
            editable={!searchLoading}
          />
          <TouchableOpacity
            style={[styles.addButton, searchLoading && { opacity: 0.7 }]}
            onPress={handleAddArea}
            disabled={searchLoading}
          >
            {searchLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* --- DANH SÁCH GỢI Ý (MỚI) --- */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {suggestions.map((s, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(s)}
              >
                <Text style={styles.suggestionText}>
                  {s.name}, {s.state ? s.state + ', ' : ''}{s.country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* --- DANH SÁCH KHU VỰC ĐÃ THÊM --- */}
        <Text style={styles.sectionTitle}>Chỉ số theo khu vực đã thêm ({customAreas.length})</Text>

        {customAreas.length > 0 ? (
          customAreas.map((item, index) => {
            if (item.error) {
              return (
                <View key={index} style={[styles.areaCard, { borderColor: '#FF0000' }]}>
                  <Text style={[styles.areaName, { color: '#FF0000' }]}>Lỗi: {item.name}</Text>
                  <Text style={styles.emptySubText}>Không thể lấy dữ liệu môi trường.</Text>
                </View>
              );
            }
            const areaAqiColor = getAqiColor(item.aqi);

            return (
              <TouchableOpacity key={index} style={styles.areaCard}>
                <View style={styles.areaInfo}>
                  <Text style={styles.areaName}>{item.name}</Text>
                  <Text style={[styles.areaStatus, { color: areaAqiColor }]}>AQI: {item.aqiStatus}</Text>
                  <Text style={styles.otherStats}>
                    <Text>Tiếng ồn: {item.noise} dBA</Text>
                    <Text> | Nước: {item.water} pH</Text>
                  </Text>
                </View>
                <View style={[styles.aqiBox, { borderColor: areaAqiColor }]}>
                  <Text style={[styles.aqiSmallVal, { color: areaAqiColor }]}>{item.aqi}</Text>
                  <Text style={styles.aqiLabel}>AQI</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.noDataText}>Hãy dùng ô tìm kiếm để thêm khu vực.</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '500', color: '#000', flex: 1 },

  content: { padding: 24 },
  currentLocationTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },

  // Main Card
  mainCard: {
    backgroundColor: '#00C853', borderRadius: 16, padding: 24, minHeight: 180,
    justifyContent: 'space-between', marginBottom: 24, position: 'relative', overflow: 'hidden'
  },
  mainTitle: { fontSize: 16, color: '#FFF', opacity: 0.9 },
  mainValue: { fontSize: 48, color: '#FFF', fontWeight: 'bold' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 5 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  advisoryText: { color: '#FFF', fontSize: 13, marginTop: 5 },
  bgIcon: { position: 'absolute', right: -20, bottom: -20 },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30
  },
  statCard: {
    width: '45%',
    backgroundColor: '#F9F9F9', borderRadius: 12, paddingVertical: 20,
    alignItems: 'center', justifyContent: 'center'
  },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 8, textAlign: 'center' },
  statValue: { fontSize: 18, color: '#000', fontWeight: '500', textAlign: 'center' },

  // Area List
  sectionTitle: { fontSize: 20, fontWeight: '500', color: '#000', marginBottom: 16, marginTop: 10 },
  areaCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#DDD', borderRadius: 16, padding: 20, marginBottom: 16
  },
  areaInfo: { flexShrink: 1, marginRight: 10 },
  areaName: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 6 },
  areaStatus: { fontSize: 13, fontStyle: 'italic', marginBottom: 4 },
  otherStats: { fontSize: 11, color: '#666' },

  aqiBox: {
    width: 70, height: 70, borderRadius: 16, borderWidth: 1, borderColor: '#000',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0
  },
  aqiSmallVal: { fontSize: 20, fontWeight: 'bold', color: '#00C853' },
  aqiLabel: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  noDataText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  emptySubText: { fontSize: 15, color: '#999', textAlign: 'center' },

  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 0,
    gap: 10,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#00C853',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles mới cho Autocomplete
  suggestionBox: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 9,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
  },
});

export default EnvironmentDataScreen;