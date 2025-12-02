import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router"; 
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, 
  Keyboard, 
  Image, // Đã thêm Image
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";
import { createGroup } from '../../src/services/groupService';
import { getPrivacySettings } from '../../src/services/userService'; 
import * as Location from 'expo-location'; 
import * as ImagePicker from 'expo-image-picker'; // IMPORT CẦN THIẾT
import { uploadFile } from '../../src/services/fileService'; // IMPORT HÀM UPLOAD THỰC TẾ

// Danh sách cấp độ khu vực có thể chọn
const AREA_LEVELS = [
    { value: 'CITY', label: 'Tỉnh/Thành phố' },
    { value: 'DISTRICT', label: 'Quận/Huyện' },
    { value: 'WARD', label: 'Phường/Xã' },
];

// --- MOCK HÀM LẤY ĐỊA CHỈ TỪ GPS ---
const getUserAddressByGPS = async () => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return null;
        }

        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        let address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });

        if (address && address.length > 0) {
             const addr = address[0];
             return { 
                ward: addr.street || addr.name || '', 
                district: addr.subregion || '', 
                city: addr.city || addr.region || '' 
             };
        }
    } catch (e) {
        console.error("Lỗi lấy địa chỉ GPS:", e);
    }
    return null;
};


const CreateCommunityScreen = () => {
  const router = useRouter();
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  
  // VỊ TRÍ INPUT STATES
  const [selectedAreaLevel, setSelectedAreaLevel] = useState('DISTRICT'); 
  const [wardName, setWardName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [cityName, setCityName] = useState('');
  const [imageUri, setImageUri] = useState(null); // STATE ẢNH ĐẠI DIỆN

  const [canPost, setCanPost] = useState("all");
  const [canCreateEvent, setCanCreateEvent] = useState("admin");
  const [loading, setLoading] = useState(false); 

  // --- STATE QUYỀN RIÊNG TƯ ---
  const [shareLocationEnabled, setShareLocationEnabled] = useState(true);
  const [isLocationDataLoaded, setIsLocationDataLoaded] = useState(false); 


  // --- LOGIC 1: KIỂM TRA QUYỀN RIÊNG TƯ VÀ TẢI VỊ TRÍ GPS ---
  const checkPrivacyAndLoadLocation = useCallback(() => {
    async function fetchData() { 
        try {
            const privacyRes = await getPrivacySettings();
            const isEnabled = privacyRes.share_location; 
            setShareLocationEnabled(isEnabled);

            if (isEnabled) {
                const userAddress = await getUserAddressByGPS();
                if (userAddress) {
                    setWardName(userAddress.ward);
                    setDistrictName(userAddress.district);
                    setCityName(userAddress.city);
                } else {
                    setShareLocationEnabled(false); 
                }
            }
        } catch (e) {
            console.error("Lỗi kiểm tra quyền riêng tư:", e);
            setShareLocationEnabled(false);
        } finally {
            setIsLocationDataLoaded(true);
        }
    }
    fetchData(); 
  }, []);
  
  useFocusEffect(checkPrivacyAndLoadLocation);


  // --- LOGIC UPLOAD ẢNH ĐẠI DIỆN (FR-8.1.1) ---
  const handleSelectImage = async () => {
    if (loading) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Tỷ lệ 1:1 cho ảnh đại diện
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };


  // --- LOGIC TÍNH TOÁN DỮ LIỆU VỊ TRÍ HIỆN TẠI ĐỂ GỬI LÊN BACKEND ---
  const getAreaDataToSend = () => {
    let name = '';
    let type = selectedAreaLevel;
    
    // 1. Kiểm tra tính hợp lệ tối thiểu dựa trên cấp độ đã chọn
    if (!cityName.trim()) return null; 

    if (selectedAreaLevel === 'DISTRICT' && !districtName.trim()) return null;
    if (selectedAreaLevel === 'WARD' && (!districtName.trim() || !wardName.trim())) return null;

    // 2. Ghép tên khu vực
    if (selectedAreaLevel === 'WARD') {
        name = `${wardName.trim()}, ${districtName.trim()}, ${cityName.trim()}`;
    } else if (selectedAreaLevel === 'DISTRICT') {
        name = `${districtName.trim()}, ${cityName.trim()}`;
    } else if (selectedAreaLevel === 'CITY') {
        name = cityName.trim();
    }

    if (name) {
        return { areaType: selectedAreaLevel, areaName: name };
    }
    return null;
  };


  // --- LOGIC 3: TẠO NHÓM CHÍNH ---
  const handleCreate = async () => {
    if (!communityName.trim() || !description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên và Mô tả cộng đồng.");
      return;
    }
    
    const areaData = getAreaDataToSend();

    if (!areaData) {
        Alert.alert("Thiếu khu vực", "Vui lòng điền đầy đủ tên khu vực theo cấp độ đã chọn.");
        return;
    }
    
    setLoading(true);
    let uploadedImageUrl = null;
    
    try {
        // 1. Upload Image (nếu có)
        if (imageUri) {
            // SỬ DỤNG HÀM UPLOADFILE THỰC TẾ TỪ FILESERVICE
            uploadedImageUrl = await uploadFile(imageUri); 
        }

        const payload = {
            name: communityName.trim(),
            description: description.trim(),
            areaType: areaData.areaType, 
            areaName: areaData.areaName, 
            isPublic: privacy === 'public', 
            imageUrl: uploadedImageUrl // Đã thêm URL ảnh vào payload
        };

        const newGroup = await createGroup(payload);

        Alert.alert(
            "Tạo cộng đồng thành công",
            `Cộng đồng "${newGroup.name}" đã được tạo!`,
            [
                {
                    text: "OK",
                    onPress: () => {
                        setLoading(false);
                        router.replace(`/community/${newGroup.id}`);
                    },
                },
            ]
        );
    } catch (error) {
        console.error("Lỗi tạo nhóm:", error.response?.data || error.message);
        Alert.alert("Lỗi", "Không thể tạo nhóm. Vui lòng kiểm tra lại dữ liệu.");
        setLoading(false);
    }
  };

  const isFormValid = communityName.trim() && description.trim() && getAreaDataToSend() && isLocationDataLoaded;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color="#0A0A0A"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo cộng đồng mới</Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!isFormValid || loading || !isLocationDataLoaded) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!isFormValid || loading || !isLocationDataLoaded}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text
              style={[
                styles.createButtonText,
                !isFormValid && styles.createButtonTextDisabled,
              ]}
            >
              Tạo
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tên cộng đồng</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập tên cộng đồng"
            placeholderTextColor="#999"
            value={communityName}
            onChangeText={setCommunityName}
            maxLength={50}
            editable={!loading}
          />
          <Text style={styles.charCount}>{communityName.length}/50</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <TextInput
            style={[styles.textInput, styles.textAreaInput]}
            placeholder="Mô tả về mục tiêu của nhóm..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
            editable={!loading}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ảnh đại diện</Text>
          <TouchableOpacity
            style={[styles.imageUploadButton, imageUri && styles.imagePreviewContainer]}
            onPress={handleSelectImage}
            activeOpacity={0.7}
            disabled={loading}
          >
            {imageUri ? (
                // Nếu có ảnh, hiển thị preview
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
                // Nếu chưa có ảnh, hiển thị placeholder
                <>
                    <MaterialCommunityIcons name="image-plus" size={40} color="#999" />
                    <Text style={styles.imageUploadSubtext}>
                        Nhấn để chọn từ thiết bị (1:1 Ratio)
                    </Text>
                </>
            )}
          </TouchableOpacity>
          
          {imageUri && (
            <TouchableOpacity 
              style={styles.removeImageBtn} 
              onPress={() => setImageUri(null)}
              disabled={loading}
            >
              <Text style={styles.removeImageText}>Xóa ảnh</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* KHU VỰC HOẠT ĐỘNG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khu vực hoạt động</Text>
          
          {/* 1. BỘ CHỌN CẤP ĐỘ */}
          <Text style={styles.subLabel}>Cấp độ hoạt động của nhóm:</Text>
          <View style={[styles.regionsGrid, styles.levelSelector]}>
              {AREA_LEVELS.map((level) => (
                  <TouchableOpacity
                      key={level.value}
                      style={[
                          styles.levelButton,
                          selectedAreaLevel === level.value && styles.levelButtonActive,
                      ]}
                      onPress={() => setSelectedAreaLevel(level.value)}
                      activeOpacity={0.7}
                      disabled={loading}
                  >
                      <Text style={[
                          styles.levelButtonText,
                          selectedAreaLevel === level.value && styles.levelButtonTextActive
                      ]}>
                          {level.label}
                      </Text>
                  </TouchableOpacity>
              ))}
          </View>
          
          {/* CẢNH BÁO */}
          {!shareLocationEnabled && (
            <View style={styles.alertBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FF5722" />
                <Text style={styles.alertText}>
                    Quyền riêng tư tắt. Vui lòng điền thủ công để xác định khu vực.
                </Text>
            </View>
          )}

          {/* HIỂN THỊ INPUTS CHI TIẾT */}
          <Text style={[styles.subLabel, {marginTop: 15}]}>
            {shareLocationEnabled ? "Địa chỉ hiện tại (có thể chỉnh sửa):" : "Nhập địa chỉ (theo cấp độ đã chọn):"}
            {shareLocationEnabled && !isLocationDataLoaded && (
                 <ActivityIndicator size="small" color="#007AFF" style={{marginLeft: 10}} />
            )}
          </Text>
          
          <View pointerEvents={shareLocationEnabled && !isLocationDataLoaded ? 'none' : 'auto'}>
              {/* INPUT TỈNH/THÀNH */}
              <TextInput
                  style={[styles.textInput, !isLocationDataLoaded && shareLocationEnabled && styles.disabledInput]}
                  placeholder="Tỉnh/Thành phố (*Bắt buộc)"
                  placeholderTextColor="#999"
                  value={cityName}
                  onChangeText={setCityName}
                  editable={!loading}
              />
              
              {/* INPUT QUẬN/HUYỆN */}
              <TextInput
                  style={[styles.textInput, !isLocationDataLoaded && shareLocationEnabled && styles.disabledInput]}
                  placeholder="Quận/Huyện (*Bắt buộc nếu cấp độ >= DISTRICT)"
                  placeholderTextColor="#999"
                  value={districtName}
                  onChangeText={setDistrictName}
                  editable={!loading}
              />

              {/* INPUT PHƯỜNG/XÃ */}
              <TextInput
                  style={[styles.textInput, !isLocationDataLoaded && shareLocationEnabled && styles.disabledInput]}
                  placeholder="Phường/Xã (*Bắt buộc nếu cấp độ WARD)"
                  placeholderTextColor="#999"
                  value={wardName}
                  onChangeText={setWardName}
                  editable={!loading}
              />
          </View>

          {/* Hiển thị Tên Khu vực sẽ gửi */}
          {getAreaDataToSend() && (
              <Text style={styles.selectedAreaText}>
                  <MaterialCommunityIcons name="check-circle" size={12} color="#34C759" /> 
                  {'  '}Khu vực: {getAreaDataToSend().areaName}
              </Text>
          )}
        </View>
        
        {/* Phần Quyền riêng tư và Quyền đăng bài giữ nguyên */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
          <View style={styles.privacyOptions}>
            <TouchableOpacity
              style={[
                styles.privacyOption,
                privacy === "public" && styles.privacyOptionActive,
              ]}
              onPress={() => setPrivacy("public")}
              activeOpacity={0.7}
              disabled={loading}
            >
              <View style={styles.privacyOptionLeft}>
                <MaterialCommunityIcons
                  name="earth"
                  size={24}
                  color={privacy === "public" ? "#007AFF" : "#666"}
                />
                <View style={styles.privacyOptionText}>
                  <Text style={styles.privacyOptionTitle}>Công khai</Text>
                  <Text style={styles.privacyOptionDesc}>
                    Mọi người có thể tìm và tham gia
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={
                  privacy === "public" ? "check-circle" : "check-circle-outline"
                }
                size={22}
                color={privacy === "public" ? "#007AFF" : "#CCC"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.privacyOption,
                privacy === "private" && styles.privacyOptionActive,
              ]}
              onPress={() => setPrivacy("private")}
              activeOpacity={0.7}
              disabled={loading}
            >
              <View style={styles.privacyOptionLeft}>
                <MaterialCommunityIcons
                  name="lock"
                  size={24}
                  color={privacy === "private" ? "#007AFF" : "#666"}
                />
                <View style={styles.privacyOptionText}>
                  <Text style={styles.privacyOptionTitle}>Riêng tư</Text>
                  <Text style={styles.privacyOptionDesc}>
                    Chỉ thành viên được mời mới tham gia
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={
                  privacy === "private"
                    ? "check-circle"
                    : "check-circle-outline"
                }
                size={22}
                color={privacy === "private" ? "#007AFF" : "#CCC"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quyền đăng bài</Text>
          <View style={styles.permissionOptions}>
            <TouchableOpacity
              style={[
                styles.permissionOption,
                canPost === "all" && styles.permissionOptionActive,
              ]}
              onPress={() => setCanPost("all")}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.permissionText}>Tất cả thành viên</Text>
              <MaterialCommunityIcons
                name={
                  canPost === "all" ? "check-circle" : "check-circle-outline"
                }
                size={20}
                color={canPost === "all" ? "#007AFF" : "#CCC"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.permissionOption,
                canPost === "admin" && styles.permissionOptionActive,
              ]}
              onPress={() => setCanPost("admin")}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.permissionText}>Chỉ quản trị viên</Text>
              <MaterialCommunityIcons
                name={
                  canPost === "admin" ? "check-circle" : "check-circle-outline"
                }
                size={20}
                color={canPost === "admin" ? "#007AFF" : "#CCC"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quyền tạo sự kiện</Text>
          <View style={styles.permissionOptions}>
            <TouchableOpacity
              style={[
                styles.permissionOption,
                canCreateEvent === "all" && styles.permissionOptionActive,
              ]}
              onPress={() => setCanCreateEvent("all")}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.permissionText}>Tất cả thành viên</Text>
              <MaterialCommunityIcons
                name={
                  canCreateEvent === "all"
                    ? "check-circle"
                    : "check-circle-outline"
                }
                size={20}
                color={canCreateEvent === "all" ? "#007AFF" : "#CCC"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.permissionOption,
                canCreateEvent === "admin" && styles.permissionOptionActive,
              ]}
              onPress={() => setCanCreateEvent("admin")}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.permissionText}>Chỉ quản trị viên</Text>
              <MaterialCommunityIcons
                name={
                  canCreateEvent === "admin"
                    ? "check-circle"
                    : "check-circle-outline"
                }
                size={20}
                color={canCreateEvent === "admin" ? "#007AFF" : "#CCC"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#F0EFED",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.3,
    flex: 1,
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  createButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  createButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  createButtonTextDisabled: {
    color: "#999",
  },

  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 12,
  },
  subLabel: {
    ...typography.small,
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
    marginTop: 4,
  },
  textInput: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  charCount: {
    ...typography.small,
    fontSize: 11,
    color: "#999",
    textAlign: "right",
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: '#E8E8E8'
  },

  imageUploadButton: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    overflow: 'hidden',
    position: 'relative'
  },
  imagePreviewContainer: {
    paddingVertical: 0,
    backgroundColor: '#FFFFFF',
    borderStyle: 'solid',
    height: 150,
    width: '100%',
    borderWidth: 0,
    borderRadius: 12,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imageUploadSubtext: {
    ...typography.small,
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  removeImageBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  removeImageText: {
    color: '#E63946',
    fontWeight: '600',
    fontSize: 13,
  },
  
  // --- CUSTOM STYLES CHO CẤP ĐỘ ---
  levelSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  levelButtonText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  levelButtonTextActive: {
    fontWeight: '700',
    color: '#0A0A0A',
  },
  
  // --- CUSTOM STYLES CHO MANUAL INPUT ---
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBE6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertText: {
    ...typography.small,
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
  },
  regionsGrid: {
    gap: 8,
  },
  regionOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 5,
  },
  regionOptionActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  regionText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  regionTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  selectedAreaText: {
    ...typography.small,
    fontSize: 13,
    color: '#333',
    marginTop: 10,
    paddingHorizontal: 5,
    fontStyle: 'italic',
  },
  // --- KẾT THÚC CUSTOM STYLES ---


  privacyOptions: {
    gap: 10,
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  privacyOptionActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  privacyOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  privacyOptionText: {
    flex: 1,
  },
  privacyOptionTitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 2,
  },
  privacyOptionDesc: {
    ...typography.small,
    fontSize: 12,
    color: "#666",
  },

  permissionOptions: {
    gap: 8,
  },
  permissionOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  permissionOptionActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  permissionText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0A0A",
  },
});

export default CreateCommunityScreen;