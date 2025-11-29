import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { createReport } from '../../src/services/reportService';
import { uploadFile } from '../../src/services/fileService';
// Import thêm các hàm mới từ store
import { getLocation, saveDraftForm, getDraftForm, clearAll, setLocation } from '../../src/utils/locationStore';

const CreateReport = () => {
  const router = useRouter();
  
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('Đang lấy vị trí...');
  const [coords, setCoords] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- 1. KHÔI PHỤC DỮ LIỆU KHI MÀN HÌNH ĐƯỢC FOCUS ---
  useFocusEffect(
    useCallback(() => {
      // A. Khôi phục Mô tả & Ảnh (nếu có lưu nháp)
      const draft = getDraftForm();
      if (draft.description) setDescription(draft.description);
      if (draft.imageUri) setImageUri(draft.imageUri);

      // B. Cập nhật vị trí từ Map (nếu có chọn mới)
      const picked = getLocation(); 
      if (picked) {
        setCoords(picked);
        
        // Dịch ngược sang tên đường
        (async () => {
          setLocationText('Đang cập nhật địa chỉ...');
          try {
            let address = await Location.reverseGeocodeAsync({
              latitude: picked.latitude,
              longitude: picked.longitude
            });
            if (address && address.length > 0) {
              const addr = address[0];
              const fullAddress = [addr.streetNumber, addr.street, addr.subregion, addr.city, addr.region]
                .filter(Boolean).join(', ');
              setLocationText(fullAddress);
            } else {
              setLocationText(`${picked.latitude.toFixed(6)}, ${picked.longitude.toFixed(6)}`);
            }
          } catch (e) {
            setLocationText(`${picked.latitude.toFixed(6)}, ${picked.longitude.toFixed(6)}`);
          }
        })();
        
        // Lưu ý: Không clearLocation() ngay ở đây để tránh mất dữ liệu nếu re-render, 
        // ta sẽ clear tất cả khi Submit thành công.
      }
    }, [])
  );

  // --- 2. LẤY GPS TỰ ĐỘNG (CHỈ CHẠY KHI CHƯA CÓ DỮ LIỆU) ---
  useEffect(() => {
    // Nếu đã có coords (từ store hoặc gps trước đó) thì thôi
    if (coords) return; 
    if (getLocation()) return;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Quyền truy cập vị trí bị từ chối');
        return;
      }
      
      try {
        let location = await Location.getCurrentPositionAsync({});
        // Check lại lần nữa trước khi set
        if (!coords && !getLocation()) {
           setCoords(location.coords);
           
           let address = await Location.reverseGeocodeAsync({
             latitude: location.coords.latitude,
             longitude: location.coords.longitude
           });
           
           if (address && address.length > 0) {
             const addr = address[0];
             const fullAddress = [addr.street, addr.subregion, addr.region].filter(Boolean).join(', ');
             setLocationText(fullAddress);
           }
        }
      } catch (error) {
        console.log("GPS Error", error);
      }
    })();
  }, []); 

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập ảnh.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Lưu nháp ngay khi chọn ảnh (đề phòng user thoát ra vào lại)
      saveDraftForm({ description, imageUri: result.assets[0].uri });
    }
  };

  // --- HÀM MỞ MAP (QUAN TRỌNG: LƯU NHÁP TRƯỚC KHI ĐI) ---
  const handleOpenMap = () => {
    // 1. Lưu dữ liệu hiện tại vào Store
    saveDraftForm({ 
      description: description, 
      imageUri: imageUri 
    });

    // 2. Chuyển sang màn hình Map
    router.push({
      pathname: '/map/map',
      params: { 
        mode: 'pick', 
        initialLat: coords?.latitude, 
        initialLng: coords?.longitude
      } 
    });
  };

  const handleSubmit = async () => {
    if (!description || !coords) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả và vị trí.");
      return;
    }
    setLoading(true);
    try {
      let uploadedMedia = [];
      if (imageUri) {
        try {
          const mediaUrl = await uploadFile(imageUri);
          uploadedMedia.push({ url: mediaUrl, type: "image" });
        } catch (err) {
          Alert.alert("Lỗi Upload", "Không thể tải ảnh lên server.");
          setLoading(false);
          return;
        }
      }
      const payload = {
        description: description,
        latitude: coords.latitude,
        longitude: coords.longitude,
        media: uploadedMedia,
        categoryId: null 
      };
      
      await createReport(payload);
      
      // --- THÀNH CÔNG: XÓA SẠCH DỮ LIỆU NHÁP ---
      clearAll(); 
      setLocation(null); // Reset luôn location trong store cho chắc

      Alert.alert("Thành công", "Báo cáo đã được gửi!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Gửi báo cáo thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // ... (Phần render UI giữ nguyên, chỉ chú ý onChangeText)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo báo cáo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ... Info Box & Time ... */}
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Cùng chung tay bảo vệ môi trường...</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Thời gian</Text>
          <Text style={styles.valueText}>{new Date().toLocaleString('vi-VN')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mô tả vấn đề</Text>
          <TextInput 
            style={styles.textArea} 
            placeholder="Nhập nội dung..." 
            multiline numberOfLines={4}
            value={description} 
            // Khi gõ chữ, cập nhật state nhưng chưa cần lưu store liên tục cho đỡ nặng
            // Store chỉ lưu khi bấm nút "Chọn bản đồ"
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Minh chứng</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={{alignItems: 'center'}}>
                <MaterialCommunityIcons name="tray-arrow-up" size={32} color="#999" />
                <Text style={styles.uploadText}>Tải ảnh lên</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
            <Text style={styles.label}>Vị trí</Text>
            {/* Nút này sẽ gọi hàm handleOpenMap đã sửa */}
            <TouchableOpacity onPress={handleOpenMap}>
              <Text style={{color: '#007AFF', fontWeight: 'bold'}}>Chọn trên bản đồ</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={24} color="#000" />
            <Text style={styles.locationText}>{locationText}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Gửi báo cáo</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ... Styles giữ nguyên ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  infoBox: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20 },
  infoText: { fontSize: 14, color: '#333' },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  valueText: { fontSize: 14, color: '#666' },
  textArea: { height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  uploadBox: { height: 120, borderWidth: 1, borderColor: '#999', borderRadius: 8, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  uploadText: { color: '#999', marginTop: 5 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationText: { flex: 1, fontSize: 14, color: '#333' },
  submitBtn: { backgroundColor: '#00C853', paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CreateReport;