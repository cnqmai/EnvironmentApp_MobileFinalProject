import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Mock data: Các điểm thu gom mẫu tại TP.HCM
const COLLECTION_POINTS = [
  { id: 1, title: 'Trung tâm tái chế xanh', address: '123 Nguyễn Văn Linh, Q.7', latitude: 10.729, longitude: 106.696, type: 'center' },
  { id: 2, title: 'Điểm thu gom EcoMart', address: '456 Lê Văn Việt, Q.9', latitude: 10.845, longitude: 106.795, type: 'mart' },
  { id: 3, title: 'Trạm xanh Gò Vấp', address: '12 Quang Trung, Gò Vấp', latitude: 10.828, longitude: 106.666, type: 'station' },
];

const MapScreen = () => {
  const router = useRouter();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Vị trí mặc định (TP.HCM)
  const [region, setRegion] = useState({
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // 1. Xin quyền và lấy vị trí hiện tại
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Quyền truy cập vị trí bị từ chối');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Di chuyển map đến vị trí người dùng
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, []);

  // Hàm quay về vị trí hiện tại
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
      {/* MAP VIEW */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE} 
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false} 
      >
        {COLLECTION_POINTS.map((point) => (
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

      {/* --- CÁC THÀNH PHẦN NỔI (OVERLAY) --- */}

      {/* 1. Top Search Bar */}
      <SafeAreaView style={styles.topContainer} edges={['top']}>
        <View style={styles.searchBar}>
          
          {/* --- NÚT BACK --- */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          {/* ---------------- */}
          
          <TouchableOpacity 
            style={styles.searchInputBtn}
            onPress={() => router.push('/map/collection-points')} 
          >
            <Text style={styles.searchText}>Tìm điểm thu gom...</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.filterBtn} 
            onPress={() => router.push('/map/filter')}
          >
             <MaterialCommunityIcons name="filter-variant" size={24} color="#00C853" />
          </TouchableOpacity>
        </View>

        {/* Categories Chips */}
        <View style={styles.chipsContainer}>
          <TouchableOpacity style={[styles.chip, styles.chipActive]}>
             <Text style={[styles.chipText, styles.chipTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
             <Text style={styles.chipText}>Pin cũ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
             <Text style={styles.chipText}>Nhựa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
             <Text style={styles.chipText}>Quần áo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* --- NÚT BẢN ĐỒ NHIỆT (MỚI) --- */}
      <TouchableOpacity 
          style={styles.heatmapBtn}
          onPress={() => router.push('/map/heatmap')}
      >
          <MaterialCommunityIcons name="fire" size={24} color="#FFF" />
          <Text style={styles.heatmapText}>Bản đồ nhiệt</Text>
      </TouchableOpacity>
      {/* ------------------------------- */}

      {/* 2. Right Actions */}
      <View style={styles.rightButtons}>
        <TouchableOpacity style={styles.circleBtn} onPress={focusUserLocation}>
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 3. Bottom Actions */}
      <View style={styles.bottomContainer}>
        
        <TouchableOpacity 
          style={[styles.floatingCard, { marginRight: 10 }]}
          onPress={() => router.push('/map/environment')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
             <MaterialCommunityIcons name="cloud-outline" size={24} color="#1976D2" />
          </View>
          <View>
             <Text style={styles.cardTitle}>Môi trường</Text>
             <Text style={styles.cardSub}>AQI: 75 (Tốt)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.floatingCard}
          onPress={() => router.push('/map/collection-points')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
             <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#2E7D32" />
          </View>
          <View>
             <Text style={styles.cardTitle}>Danh sách</Text>
             <Text style={styles.cardSub}>Xem chi tiết</Text>
          </View>
        </TouchableOpacity>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { ...StyleSheet.absoluteFillObject },

  topContainer: { position: 'absolute', top: 0, width: '100%', paddingHorizontal: 20, paddingTop: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  // Style cho nút Back
  backBtn: { 
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  searchInputBtn: { flex: 1, marginHorizontal: 5 },
  searchText: { color: '#666', fontSize: 16 },
  filterBtn: { borderLeftWidth: 1, borderLeftColor: '#EEE', paddingLeft: 10 },

  chipsContainer: { flexDirection: 'row', marginTop: 12 },
  chip: {
    backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1
  },
  chipActive: { backgroundColor: '#00C853' },
  chipText: { fontSize: 13, color: '#333', fontWeight: '500' },
  chipTextActive: { color: '#FFF' },

  // Style cho nút Heatmap
  heatmapBtn: {
    position: 'absolute',
    top: 160, // Đặt bên dưới phần search/chip
    right: 20,
    backgroundColor: '#FF5722', // Màu cam nổi bật cho "nhiệt"
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  heatmapText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13
  },

  markerContainer: { alignItems: 'center' },
  markerCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#00C853',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF'
  },
  markerArrow: {
    width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderStyle: 'solid', backgroundColor: 'transparent', borderLeftColor: 'transparent',
    borderRightColor: 'transparent', borderTopColor: '#00C853', marginTop: -2
  },

  rightButtons: { position: 'absolute', right: 20, top: '45%' }, // Hạ thấp xuống chút để tránh nút heatmap
  circleBtn: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1
  },

  bottomContainer: {
    position: 'absolute', bottom: 30, width: '100%', flexDirection: 'row',
    paddingHorizontal: 20, justifyContent: 'space-between'
  },
  floatingCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12,
    flexDirection: 'row', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: {width: 0, height: 4}
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  cardSub: { fontSize: 12, color: '#666' },
});

export default MapScreen;