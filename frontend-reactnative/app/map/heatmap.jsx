import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dữ liệu giả lập cho Heatmap
const HEATMAP_POINTS = [
  { latitude: 10.762, longitude: 106.660, weight: 1 },
  { latitude: 10.765, longitude: 106.665, weight: 1 },
  { latitude: 10.770, longitude: 106.670, weight: 2 },
  { latitude: 10.775, longitude: 106.680, weight: 3 },
  { latitude: 10.780, longitude: 106.690, weight: 1 },
  { latitude: 10.750, longitude: 106.650, weight: 1 },
  { latitude: 10.740, longitude: 106.640, weight: 2 },
  // Tạo thêm nhiều điểm ngẫu nhiên
  ...Array.from({ length: 20 }).map(() => ({
      latitude: 10.7 + (Math.random() * 0.1),
      longitude: 106.6 + (Math.random() * 0.1),
      weight: Math.floor(Math.random() * 3) + 1
  }))
];

const HeatmapScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 10.762622, longitude: 106.660172,
          latitudeDelta: 0.1, longitudeDelta: 0.1,
        }}
        zoomEnabled={true} // Đảm bảo đã bật zoom
        scrollEnabled={true}
      >
        <Heatmap 
            points={HEATMAP_POINTS}
            opacity={0.7}
            radius={40}
            gradient={{
                colors: ["#00E676", "#FFEB3B", "#FF5722"],
                startPoints: [0.2, 0.5, 0.8],
                colorMapSize: 256
            }}
        />
      </MapView>

      {/* --- SỬA LỖI TẠI ĐÂY --- */}
      {/* Thêm pointerEvents="box-none" để cho phép chạm xuyên qua vùng trống */}
      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
                <Text style={styles.title}>Bản đồ nhiệt môi trường</Text>
                <Text style={styles.subtitle}>Dữ liệu chất lượng không khí (AQI)</Text>
            </View>
        </View>

        {/* Legend (Chú thích) */}
        <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Mức độ ô nhiễm:</Text>
            <View style={styles.barContainer}>
                <View style={[styles.barSegment, { backgroundColor: '#00E676' }]} />
                <View style={[styles.barSegment, { backgroundColor: '#FFEB3B' }]} />
                <View style={[styles.barSegment, { backgroundColor: '#FF5722' }]} />
            </View>
            <View style={styles.labels}>
                <Text style={styles.label}>Tốt</Text>
                <Text style={styles.label}>Trung bình</Text>
                <Text style={styles.label}>Kém</Text>
            </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  
  header: { 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: 'rgba(0,0,0,0.7)', padding: 15, borderRadius: 16 
  },
  backBtn: { marginRight: 15, padding: 5 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#CCC', fontSize: 12 },

  legendContainer: { 
      backgroundColor: '#FFF', padding: 20, borderRadius: 16, 
      elevation: 5, shadowColor: '#000', shadowOpacity: 0.1 
  },
  legendTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  barContainer: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 5 },
  barSegment: { flex: 1 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, color: '#666' }
});

export default HeatmapScreen;