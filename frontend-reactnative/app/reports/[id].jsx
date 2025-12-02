import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { updateReportStatus } from '../../src/services/reportService';
import { getMyProfile } from '../../src/services/userService';

const ADMIN_EMAILS = ['cnqmai@gmail.com'];

const ReportDetail = () => {
  const { reportData } = useLocalSearchParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [addressText, setAddressText] = useState('Đang tải địa chỉ...');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyProfile();
        if (profile?.email) {
          setCurrentUserEmail(profile.email);
          setIsAdminUser(ADMIN_EMAILS.includes(profile.email.toLowerCase()));
        } else {
          setCurrentUserEmail(null);
          setIsAdminUser(false);
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
        setCurrentUserEmail(null);
        setIsAdminUser(false);
      }
    };

    fetchProfile();
  }, []);

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
    if (status === 'COMPLETED' || status === 'RESOLVED') return 1;
    if (status === 'PROCESSING' || status === 'IN_PROGRESS') return 0.5;
    return 0.1; 
  };

  // Normalize status từ backend (có thể là "received", "processing" hoặc "RECEIVED", "IN_PROGRESS")
  const normalizeStatus = (status) => {
    if (!status) return null;
    const statusStr = String(status).toUpperCase();
    const statusMap = {
      'RECEIVED': 'RECEIVED',
      'IN_PROGRESS': 'IN_PROGRESS',
      'PROCESSING': 'IN_PROGRESS',
      'RESOLVED': 'RESOLVED',
      'COMPLETED': 'RESOLVED',
      'REJECTED': 'REJECTED'
    };
    return statusMap[statusStr] || statusStr;
  };

  // Map status từ backend sang display
  const getStatusDisplay = (status) => {
    const normalized = normalizeStatus(status);
    const statusMap = {
      'RECEIVED': 'Đã gửi',
      'IN_PROGRESS': 'Đang xử lý',
      'RESOLVED': 'Hoàn thành',
      'REJECTED': 'Từ chối'
    };
    return statusMap[normalized] || status;
  };

  // Các trạng thái có thể chọn (gửi enum name lên backend)
  const statusOptions = [
    { value: 'RECEIVED', label: 'Đã gửi', color: '#2196F3' },
    { value: 'IN_PROGRESS', label: 'Đang xử lý', color: '#FF9800' },
    { value: 'RESOLVED', label: 'Hoàn thành', color: '#4CAF50' },
    { value: 'REJECTED', label: 'Từ chối', color: '#F44336' }
  ];

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !report) return;
    if (!isAdminUser) {
      Alert.alert('Không có quyền', 'Chỉ quản trị viên mới được thay đổi trạng thái.');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedReport = await updateReportStatus(report.id, selectedStatus);
      setReport(updatedReport);
      setShowStatusModal(false);
      setSelectedStatus(null);
      Alert.alert('Thành công', 'Trạng thái báo cáo đã được cập nhật.');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể cập nhật trạng thái. Bạn có thể không có quyền thực hiện thao tác này.'
      );
    } finally {
      setIsUpdating(false);
    }
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

        {/* Status Bar */}
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
            <View style={[styles.dot, { left: '50%', backgroundColor: normalizeStatus(report.status) !== 'RECEIVED' ? '#2196F3' : '#e0e0e0' }]} />
            <View style={[styles.dot, { left: '100%', backgroundColor: normalizeStatus(report.status) === 'RESOLVED' ? '#2196F3' : '#e0e0e0', marginLeft: -12 }]} />
          </View>
          
          <View style={styles.currentStatusRow}>
            <Text style={styles.currentStatusLabel}>Trạng thái hiện tại:</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusOptions.find(s => s.value === normalizeStatus(report.status))?.color || '#999' }]}>
              <Text style={styles.statusBadgeText}>{getStatusDisplay(report.status)}</Text>
            </View>
          </View>
        </View>

        {isAdminUser && (
          <>
            {/* Admin Section: Change Status */}
            <View style={styles.adminSection}>
              <View style={styles.adminHeader}>
                <MaterialCommunityIcons name="shield-account" size={20} color="#666" />
                <Text style={styles.adminTitle}>Quản trị viên</Text>
              </View>
              <Text style={styles.adminDescription}>
                Thay đổi trạng thái báo cáo này (chỉ dành cho quản trị viên)
              </Text>
              <TouchableOpacity
                style={styles.changeStatusButton}
                onPress={() => {
                  setSelectedStatus(normalizeStatus(report.status));
                  setShowStatusModal(true);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="pencil" size={18} color="#007AFF" />
                <Text style={styles.changeStatusButtonText}>Thay đổi trạng thái</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>

      {/* Status Selection Modal */}
      {isAdminUser && (
        <Modal
          visible={showStatusModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn trạng thái mới</Text>
                <TouchableOpacity
                  onPress={() => setShowStatusModal(false)}
                  style={styles.modalCloseButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.statusOptionsList}>
                {statusOptions.map((option) => {
                  const isSelected = selectedStatus === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusOption,
                        isSelected && styles.statusOptionSelected
                      ]}
                      onPress={() => setSelectedStatus(option.value)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.statusOptionDot, { backgroundColor: option.color }]} />
                      <Text style={[
                        styles.statusOptionText,
                        isSelected && styles.statusOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <MaterialCommunityIcons name="check-circle" size={20} color={option.color} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowStatusModal(false)}
                  disabled={isUpdating}
                >
                  <Text style={styles.modalButtonCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonConfirm,
                    (!selectedStatus || isUpdating) && styles.modalButtonDisabled
                  ]}
                  onPress={handleUpdateStatus}
                  disabled={!selectedStatus || isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalButtonConfirmText}>Cập nhật</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, top: -1 },
  currentStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  currentStatusLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusBadgeText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  adminSection: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginTop: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  adminHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  adminTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  adminDescription: { fontSize: 13, color: '#666', marginBottom: 15, lineHeight: 18 },
  changeStatusButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F8FF', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF' },
  changeStatusButtonText: { color: '#007AFF', fontSize: 15, fontWeight: '600', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalCloseButton: { padding: 4 },
  statusOptionsList: { maxHeight: 300, padding: 20 },
  statusOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10, backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: 'transparent' },
  statusOptionSelected: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
  statusOptionDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  statusOptionText: { flex: 1, fontSize: 15, color: '#333' },
  statusOptionTextSelected: { fontWeight: '600', color: '#2196F3' },
  modalActions: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, gap: 10 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modalButtonCancel: { backgroundColor: '#F5F5F5' },
  modalButtonConfirm: { backgroundColor: '#007AFF' },
  modalButtonDisabled: { backgroundColor: '#CCC', opacity: 0.6 },
  modalButtonCancelText: { color: '#333', fontSize: 15, fontWeight: '600' },
  modalButtonConfirmText: { color: '#FFF', fontSize: 15, fontWeight: '600' }
});

export default ReportDetail;