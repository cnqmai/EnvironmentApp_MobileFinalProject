import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, TextInput, Keyboard, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCollectionPoints, getWasteCategories } from '../../src/services/mapService'; 
import { setLocation } from '../../src/utils/locationStore'; 

import axios from 'axios'; // Import axios
import { API_BASE_URL } from '../../src/constants/api'; // Import BASE_URL
import { getAqiStatusText, getAqiColor } from '../../src/utils/aqiUtils'; // Import helper AQI

// Khai báo lại BASE_URL
const BASE_URL = API_BASE_URL;

// --- HÀM MAPPING DÙNG CHUNG (Giữ nguyên) ---
const mapVietnameseToEnum = (name) => {
    if (!name) return 'OTHER';
    const lowerName = name.toLowerCase();

    if (lowerName.includes('nhựa')) return 'PLASTIC';
    if (lowerName.includes('điện tử')) return 'ELECTRONIC';
    if (lowerName.includes('hữu cơ')) return 'ORGANIC';
    if (lowerName.includes('kim loại')) return 'METAL';
    if (lowerName.includes('thủy tinh')) return 'GLASS';
    if (lowerName.includes('giấy')) return 'PAPER';
    if (lowerName.includes('nguy hại') || lowerName.includes('pin')) return 'HAZARDOUS';
    if (lowerName.includes('y tế')) return 'MEDICAL';
    if (lowerName.includes('xây dựng')) return 'CONSTRUCTION'; 
    
    return 'OTHER';
};

const getMarkerIcon = (type) => {
    switch (type) {
        case 'PLASTIC': return 'recycle';
        case 'ELECTRONIC': return 'laptop-off';
        case 'ORGANIC': return 'food-apple-outline';
        case 'HAZARDOUS': return 'biohazard';
        case 'GLASS': return 'bottle-wine-outline';
        case 'PAPER': return 'file-document-outline';
        case 'MEDICAL': return 'medication-outline';
        case 'METAL': return 'basket-fill';
        case 'CONSTRUCTION': return 'dump-truck';
        default: return 'trash-can';
    }
};

const MapScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const mapRef = useRef(null);
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [collectionPoints, setCollectionPoints] = useState([]); 
  const [wasteCategories, setWasteCategories] = useState([]);   
  const [activeFilterType, setActiveFilterType] = useState('ALL'); 
  const [loadingMapData, setLoadingMapData] = useState(false);

  const [aqiData, setAqiData] = useState({ aqi: '...', status: '(Đang tải)' });

  const [pickedLocation, setPickedLocation] = useState(
    params.initialLat && params.initialLng 
      ? { latitude: parseFloat(params.initialLat), longitude: parseFloat(params.initialLng) }
      : null
  );
  const [searchText, setSearchText] = useState('');
  const isPickMode = params?.mode === 'pick';

  const [region, setRegion] = useState({
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // --- HÀM FETCH AQI ---
  const fetchAqiData = async (lat, lon) => {
    try {
        const response = await axios.get(`${BASE_URL}/aqi`, {
            params: { lat, lon }
        });
        const calculatedAqi = response.data.calculatedAqiValue;
        setAqiData({
            aqi: calculatedAqi,
            status: getAqiStatusText(calculatedAqi)
        });
    } catch (e) {
        console.error("Lỗi tải AQI:", e);
        setAqiData({ aqi: 'N/A', status: '(Không tải được)' });
    }
  };

  // --- LOGIC GPS & FETCH DATA ---
  const fetchMapData = async (lat, lon, type) => {
    setLoadingMapData(true);
    try {
        const [points, categories] = await Promise.all([
            getCollectionPoints(lat, lon, type),
            getWasteCategories(), 
        ]);
        
        setCollectionPoints(points);
        
        const mappedCategories = categories.map(cat => ({
            id: cat.id, 
            name: cat.name, 
            type: mapVietnameseToEnum(cat.name),
        }));

        setWasteCategories([{ id: 0, name: 'Tất cả', type: 'ALL' }, ...mappedCategories]);

    } catch (e) {
        Alert.alert("Lỗi tải dữ liệu", "Không thể tải điểm thu gom.");
        console.error("Map Data Fetch Error:", e);
    } finally {
        setLoadingMapData(false);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let currentLocation = await Location.getCurrentPositionAsync({});
      setCurrentLocation(currentLocation);
      const lat = currentLocation.coords.latitude;
      const lon = currentLocation.coords.longitude;

      if (!params.initialLat && mapRef.current) {
        mapRef.current.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      }

      fetchMapData(lat, lon, activeFilterType);
      fetchAqiData(lat, lon);
    })();
  }, []);

  // Re-fetch khi activeFilterType thay đổi (do bấm Chip)
  useEffect(() => {
    if (currentLocation) {
        fetchMapData(currentLocation.coords.latitude, currentLocation.coords.longitude, activeFilterType);
    }
  }, [activeFilterType]); 


  const handleMapPress = (e) => {
    if (isPickMode) {
      setPickedLocation(e.nativeEvent.coordinate);
      Keyboard.dismiss();
    }
  };

  const handleConfirmLocation = () => {
    if (!pickedLocation) {
      Alert.alert("Chưa chọn", "Vui lòng chạm vào bản đồ để ghim vị trí.");
      return;
    }
    setLocation({ latitude: pickedLocation.latitude, longitude: pickedLocation.longitude });
    router.back();
  };

  const handleSearchAddress = async () => {
    if (!searchText.trim()) return;
    try {
      let result = await Location.geocodeAsync(searchText);
      if (result.length > 0) {
        const { latitude, longitude } = result[0];
        const newCoords = { latitude, longitude };
        mapRef.current.animateToRegion({ ...newCoords, latitudeDelta: 0.005, longitudeDelta: 0.005 });
        if (isPickMode) setPickedLocation(newCoords);
      }
    } catch (error) {}
  };

  const focusUserLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleFilterPress = (type) => {
    setActiveFilterType(type);
  };

  const environmentIconColor = aqiData.aqi !== 'N/A' && aqiData.aqi !== '...' ? getAqiColor(aqiData.aqi) : '#E3F2FD';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE} 
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false} 
        onPress={handleMapPress} 
      >
        {pickedLocation && isPickMode && (
          <Marker coordinate={pickedLocation} pinColor="red" title="Vị trí chọn" />
        )}

        {collectionPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.name}
            description={point.address}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerCircle}>
                 <MaterialCommunityIcons name={getMarkerIcon(point.type)} size={18} color="#FFF" />
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
        {loadingMapData && <ActivityIndicator style={styles.loadingOverlay} size="large" color="#00C853" />}
      </MapView>

      {/* --- UI ĐIỀU KHIỂN --- */}
      {isPickMode ? (
        // GIAO DIỆN CHỌN VỊ TRÍ (Giữ nguyên)
        <SafeAreaView style={styles.pickModeOverlay} edges={['top', 'bottom']}>
          <View style={styles.pickContainer}>
            <View style={styles.pickHeaderRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.pickTitle}>Chọn vị trí</Text>
                <View style={{width: 24}} /> 
            </View>
            <View style={styles.searchBoxContainer}>
                <TextInput style={styles.searchInput} placeholder="Nhập địa chỉ..." value={searchText} onChangeText={setSearchText} onSubmitEditing={handleSearchAddress} />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearchAddress}><MaterialCommunityIcons name="magnify" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <Text style={styles.hintText}>Chạm vào bản đồ hoặc tìm kiếm để ghim</Text>
          </View>
          <View style={{flex: 1}} /> 
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmLocation}>
            <Text style={styles.confirmBtnText}>Xác nhận vị trí này</Text>
          </TouchableOpacity>
        </SafeAreaView>

      ) : (
        // --- UI CHẾ ĐỘ THƯỜNG ---
        <>
          <SafeAreaView style={styles.topContainer} edges={['top']}>
            <View style={styles.searchBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                 <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.searchInputBtn}
                onPress={() => router.push('/map/collection-points')} 
              >
                <Text style={styles.searchText}>Tìm điểm thu gom...</Text>
              </TouchableOpacity>
              {/* NÚT FILTER ĐÃ BỊ XÓA VÌ KHÔNG CẦN THIẾT */}
            </View>

            {/* Chips Container - Tự động highlight theo activeFilterType */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingLeft: 20}}>
                <View style={styles.chipsContainer}>
                    {wasteCategories.map((category) => (
                        <TouchableOpacity 
                            key={category.id}
                            style={[
                                styles.chip, 
                                (activeFilterType === category.type) && styles.chipActive
                            ]}
                            onPress={() => handleFilterPress(category.type)}
                        >
                            <Text style={[
                                styles.chipText, 
                                (activeFilterType === category.type) && styles.chipTextActive
                            ]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
          </SafeAreaView>

          <TouchableOpacity style={styles.heatmapBtn} onPress={() => router.push('/map/heatmap')}>
              <MaterialCommunityIcons name="fire" size={24} color="#FFF" />
              <Text style={styles.heatmapText}>Bản đồ nhiệt</Text>
          </TouchableOpacity>

          <View style={styles.rightButtons}>
            <TouchableOpacity style={styles.circleBtn} onPress={focusUserLocation}>
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={[styles.floatingCard, { marginRight: 10 }]} onPress={() => router.push('/map/environment')}>
              {/* CẬP NHẬT: Icon Box color dựa trên AQI */}
              <View style={[styles.iconBox, { backgroundColor: environmentIconColor }]}>
                <MaterialCommunityIcons name="cloud-outline" size={24} color="#FFF" />
              </View>
               <View>
                  <Text style={styles.cardTitle}>Môi trường</Text>
                  <Text style={styles.cardSub}>
                      AQI: {aqiData.aqi}
                  </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.floatingCard} onPress={() => router.push('/map/collection-points')}>
              <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                 <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#2E7D32" />
              </View>
              <View><Text style={styles.cardTitle}>Danh sách</Text><Text style={styles.cardSub}>Xem chi tiết</Text></View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { ...StyleSheet.absoluteFillObject },
  loadingOverlay: { position: 'absolute', top: '50%', left: '50%', zIndex: 10 },
  
  pickModeOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'space-between', padding: 20, pointerEvents: 'box-none' },
  pickContainer: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 15, elevation: 5 },
  pickHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  pickTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  closeBtn: { padding: 5 },
  searchBoxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  searchInput: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 12, height: 44, marginRight: 10, fontSize: 14 },
  searchBtn: { backgroundColor: '#00C853', width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  hintText: { fontSize: 12, color: '#666', textAlign: 'center', fontStyle: 'italic' },
  confirmBtn: { backgroundColor: '#00C853', padding: 15, borderRadius: 30, alignItems: 'center', elevation: 5, marginBottom: 20, width: '100%' },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  topContainer: { position: 'absolute', top: 0, width: '100%', paddingTop: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginHorizontal: 20 },
  backBtn: { marginRight: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: '#F0F0F0' },
  searchInputBtn: { flex: 1, marginHorizontal: 5 },
  searchText: { color: '#666', fontSize: 16 },
  filterBtn: { borderLeftWidth: 1, borderLeftColor: '#EEE', paddingLeft: 10 },
  
  chipsContainer: { flexDirection: 'row', marginTop: 12, paddingHorizontal: 20 },
  chip: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, borderWidth: 1, borderColor: '#DDD' },
  chipActive: { backgroundColor: '#00C853', borderColor: '#00C853' },
  chipText: { fontSize: 13, color: '#333', fontWeight: '500' },
  chipTextActive: { color: '#FFF' },

  heatmapBtn: { position: 'absolute', top: 160, right: 20, backgroundColor: '#FF5722', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 } },
  heatmapText: { color: '#FFF', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  markerContainer: { alignItems: 'center' },
  markerCircle: { width: 40, height: 40, borderRadius: 16, backgroundColor: '#00C853', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  markerArrow: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderStyle: 'solid', backgroundColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#00C853', marginTop: -2 },
  rightButtons: { position: 'absolute', right: 20, top: '45%' },
  circleBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
  bottomContainer: { position: 'absolute', bottom: 30, width: '100%', flexDirection: 'row', paddingHorizontal: 20, justifyContent: 'space-between' },
  floatingCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: {width: 0, height: 4} },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  cardSub: { fontSize: 12, color: '#666' },
});

export default MapScreen;