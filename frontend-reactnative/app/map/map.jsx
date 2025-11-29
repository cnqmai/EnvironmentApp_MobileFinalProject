import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, TextInput, Keyboard } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setLocation } from '../../src/utils/locationStore'; // <--- IMPORT MỚI

const COLLECTION_POINTS = [
  { id: 1, title: 'Trung tâm tái chế xanh', address: '123 Nguyễn Văn Linh, Q.7', latitude: 10.729, longitude: 106.696 },
  { id: 2, title: 'Điểm thu gom EcoMart', address: '456 Lê Văn Việt, Q.9', latitude: 10.845, longitude: 106.795 },
  { id: 3, title: 'Trạm xanh Gò Vấp', address: '12 Quang Trung, Gò Vấp', latitude: 10.828, longitude: 106.666 },
];

const MapScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef(null);
  
  const [location, setLocationState] = useState(null);
  
  // Khởi tạo pickedLocation từ params nếu có
  const [pickedLocation, setPickedLocation] = useState(
    params.initialLat && params.initialLng 
      ? { 
          latitude: parseFloat(params.initialLat), 
          longitude: parseFloat(params.initialLng) 
        }
      : null
  );

  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const isPickMode = params?.mode === 'pick';

  const [region, setRegion] = useState({
    latitude: params.initialLat ? parseFloat(params.initialLat) : 10.762622,
    longitude: params.initialLng ? parseFloat(params.initialLng) : 106.660172,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocationState(currentLocation);
      
      if (!params.initialLat && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, []);

  const handleMapPress = (e) => {
    if (isPickMode) {
      setPickedLocation(e.nativeEvent.coordinate);
      Keyboard.dismiss();
    }
  };

  // --- HÀM XÁC NHẬN (ĐÃ SỬA) ---
  const handleConfirmLocation = () => {
    if (!pickedLocation) {
      Alert.alert("Chưa chọn", "Vui lòng chạm vào bản đồ hoặc tìm kiếm để ghim vị trí.");
      return;
    }
    
    // 1. Lưu vào Store thay vì setParams
    setLocation({
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude
    });

    // 2. Quay về (không làm reload trang cũ)
    router.back();
  };

  const handleSearchAddress = async () => {
    if (!searchText.trim()) return;
    setIsSearching(true);
    Keyboard.dismiss();

    try {
      let result = await Location.geocodeAsync(searchText);
      if (result.length > 0) {
        const { latitude, longitude } = result[0];
        const newCoords = { latitude, longitude };

        mapRef.current.animateToRegion({
          ...newCoords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        
        if (isPickMode) {
            setPickedLocation(newCoords);
        }
      } else {
        Alert.alert("Không tìm thấy", "Không tìm thấy địa chỉ này.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tìm kiếm địa chỉ lúc này.");
    } finally {
      setIsSearching(false);
    }
  };

  const focusUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
        Alert.alert("Thông báo", "Đang lấy vị trí của bạn...");
    }
  };

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

        {!isPickMode && COLLECTION_POINTS.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.title}
            description={point.address}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerCircle}>
                 <MaterialCommunityIcons name="recycle" size={18} color="#FFF" />
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* --- UI ĐIỀU KHIỂN --- */}
      {isPickMode ? (
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
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Nhập địa chỉ (VD: Chợ Bến Thành)..."
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearchAddress}
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearchAddress}>
                    <MaterialCommunityIcons name="magnify" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>
            <Text style={styles.hintText}>Chạm vào bản đồ hoặc tìm kiếm để ghim</Text>
          </View>

          <View style={{flex: 1}} /> 

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmLocation}>
            <Text style={styles.confirmBtnText}>Xác nhận vị trí này</Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <>
          <SafeAreaView style={styles.topContainer} edges={['top']}>
            <View style={styles.searchBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                 <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchInputBtn} onPress={() => router.push('/map/collection-points')}>
                <Text style={styles.searchText}>Tìm điểm thu gom...</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/map/filter')}>
                 <MaterialCommunityIcons name="filter-variant" size={24} color="#00C853" />
              </TouchableOpacity>
            </View>
            <View style={styles.chipsContainer}>
              <TouchableOpacity style={[styles.chip, styles.chipActive]}><Text style={[styles.chipText, styles.chipTextActive]}>Tất cả</Text></TouchableOpacity>
              <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Pin cũ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Nhựa</Text></TouchableOpacity>
              <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Quần áo</Text></TouchableOpacity>
            </View>
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
              <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                 <MaterialCommunityIcons name="cloud-outline" size={24} color="#1976D2" />
              </View>
              <View><Text style={styles.cardTitle}>Môi trường</Text><Text style={styles.cardSub}>AQI: 75 (Tốt)</Text></View>
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
  
  // Styles cũ
  topContainer: { position: 'absolute', top: 0, width: '100%', paddingHorizontal: 20, paddingTop: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  backBtn: { marginRight: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: '#F0F0F0' },
  searchInputBtn: { flex: 1, marginHorizontal: 5 },
  searchText: { color: '#666', fontSize: 16 },
  filterBtn: { borderLeftWidth: 1, borderLeftColor: '#EEE', paddingLeft: 10 },
  chipsContainer: { flexDirection: 'row', marginTop: 12 },
  chip: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1 },
  chipActive: { backgroundColor: '#00C853' },
  chipText: { fontSize: 13, color: '#333', fontWeight: '500' },
  chipTextActive: { color: '#FFF' },
  heatmapBtn: { position: 'absolute', top: 160, right: 20, backgroundColor: '#FF5722', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 } },
  heatmapText: { color: '#FFF', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  markerContainer: { alignItems: 'center' },
  markerCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#00C853', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
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