import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location'; // Thêm import này

const ReportDetail = () => {
  const { reportData } = useLocalSearchParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [addressText, setAddressText] = useState('Đang tải địa chỉ...'); // State lưu địa chỉ text

  useEffect(() => {
    if (reportData) {
      try {
        const parsedData = JSON.parse(reportData);
        setReport(parsedData);
        
        // Gọi hàm lấy địa chỉ ngay khi có dữ liệu báo cáo
        fetchAddress(parsedData.latitude, parsedData.longitude);
      } catch (e) {
        console.error("Parse error", e);
      }
    }
  }, [reportData]);

  // Hàm dịch tọa độ sang địa chỉ
  const fetchAddress = async (lat, long) => {
    try {
      // Kiểm tra quyền (thường thì app đã có quyền từ lúc tạo báo cáo)
      // Nhưng an toàn thì cứ check nhẹ hoặc bỏ qua nếu chắc chắn
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddressText(`${lat}, ${long}`); // Fallback về tọa độ nếu không có quyền
        return;
      }

      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: long
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        // Ghép chuỗi địa chỉ đẹp
        const formattedAddress = [
          addr.streetNumber,
          addr.street,
          addr.district,     // Quận/Huyện
          addr.subregion,    // Phường/Xã (tùy OS)
          addr.city,         // Thành phố
          addr.region        // Tỉnh
        ].filter(Boolean).join(', '); // Lọc bỏ giá trị null/undefined và nối lại

        setAddressText(formattedAddress || 'Không xác định được địa chỉ');
      }
    } catch (error) {
      console.error("Geocode error:", error);
      setAddressText(`${lat}, ${long}`); // Fallback nếu lỗi mạng
    }
  };

  if (!report) return <View style={styles.loadingContainer}><Text>Đang tải dữ liệu...</Text></View>;

  // ... (Phần logic ảnh và status giữ nguyên) ...
  const firstImage = report.reportMedia && report.reportMedia.length > 0 
    ? report.reportMedia[0].mediaUrl 
    : null;

  const getStatusProgress = (status) => {
    if (status === 'COMPLETED') return 1;
    if (status === 'PROCESSING') return 0.5;
    return 0.1; 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ... (Header giữ nguyên) ... */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.reportTitle}>Báo cáo #{report.id}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Cùng chung tay bảo vệ môi trường bằng cách thông báo các vấn đề bạn gặp.
          </Text>
        </View>

        <View style={styles.bigContainer}>
          
          {/* 1. Thời gian */}
          <View style={styles.section}>
            <Text style={styles.label}>Thời gian</Text>
            <Text style={styles.valueText}>
              {new Date(report.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>

          {/* 2. Mô tả */}
          <View style={styles.section}>
            <Text style={styles.label}>Mô tả vấn đề</Text>
            <View style={styles.borderBox}>
              <Text style={styles.descText}>{report.description}</Text>
            </View>
          </View>

          {/* 3. Minh chứng */}
          {firstImage ? (
            <View style={styles.section}>
              <Text style={styles.label}>Minh chứng</Text>
              <View style={styles.imageBox}>
                <Image source={{ uri: firstImage }} style={styles.evidenceImg} />
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.label}>Minh chứng</Text>
              <Text style={{fontStyle: 'italic', color: '#999'}}>Không có hình ảnh</Text>
            </View>
          )}

          {/* 4. Vị trí (ĐÃ SỬA: Hiển thị addressText thay vì lat/long) */}
          <View style={styles.section}>
            <Text style={styles.label}>Vị trí</Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#000" />
              <Text style={styles.locationText}>
                {addressText} {/* Hiển thị địa chỉ đã dịch */}
              </Text>
            </View>
          </View>

        </View>

        {/* ... (Phần Status Bar giữ nguyên) ... */}
        <View style={styles.statusBarCard}>
          <View style={styles.statusLabels}>
            <Text style={styles.statusLabel}>Đã gửi</Text>
            <Text style={[styles.statusLabel, { fontWeight: 'bold' }]}>Đang xử lý</Text>
            <Text style={styles.statusLabel}>Hoàn thành</Text>
          </View>
          
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { flex: getStatusProgress(report.status) }
                ]} 
              />
            </View>
            <View style={[styles.dot, { left: '0%', backgroundColor: '#2196F3' }]} />
            <View style={[styles.dot, { left: '50%', backgroundColor: report.status !== 'RECEIVED' ? '#2196F3' : '#e0e0e0' }]} />
            <View style={[styles.dot, { left: '100%', backgroundColor: report.status === 'COMPLETED' ? '#2196F3' : '#e0e0e0', marginLeft: -12 }]} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Giữ nguyên toàn bộ styles cũ của bạn)
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 40 },
  reportTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  infoBox: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  infoText: { fontSize: 14, color: '#555' },
  bigContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  valueText: { fontSize: 15, color: '#666' },
  borderBox: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, backgroundColor: '#FAFAFA' },
  descText: { fontSize: 15, color: '#333', lineHeight: 22 },
  imageBox: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, height: 180, overflow: 'hidden', backgroundColor: '#FAFAFA' },
  evidenceImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  locationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  locationText: { marginLeft: 10, fontSize: 14, color: '#333', flex: 1 },
  statusBarCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 2 },
  statusLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statusLabel: { fontSize: 13, color: '#555' },
  progressBarWrapper: { height: 10, justifyContent: 'center', position: 'relative' },
  progressBarBackground: { flexDirection: 'row', height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, overflow: 'hidden', flex: 1, marginHorizontal: 5 },
  progressBarFill: { backgroundColor: '#2196F3', height: '100%' },
  dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, top: -1 }
});

export default ReportDetail;