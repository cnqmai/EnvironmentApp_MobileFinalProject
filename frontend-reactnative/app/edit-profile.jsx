import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location"; 
import * as ImagePicker from 'expo-image-picker';
import typography from "../styles/typography";
import { API_BASE_URL } from '../src/constants/api';
import { getMyProfile, updateProfile } from "../src/services/userService";
import { getToken } from '../src/utils/apiHelper';

const EditProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false); 
  const [uploading, setUploading] = useState(false);

  // State thông tin
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUri, setAvatarUri] = useState(null); 
  const [newAvatarSelected, setNewAvatarSelected] = useState(false); 

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await getMyProfile();
      setFullName(user.fullName || "");
      setGender(user.gender || "");
      setBirthDate(user.dateOfBirth || "");
      setLocation(user.defaultLocation || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
      setAvatarUri(user.avatarUrl || null); 
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập thư viện ảnh.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images', 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setNewAvatarSelected(true);
    }
  };

  const uploadImage = async (uri) => {
    const uriParts = uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1];
    const fileName = `avatar_${Date.now()}.${fileExtension}`;
    const token = await getToken();

    const formData = new FormData();
    formData.append('file', { 
      uri: uri,
      name: fileName,
      type: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Lỗi khi tải ảnh lên máy chủ.");
      const result = await response.json();
      let uploadedUrl = result.avatarUrl;
      if (uploadedUrl && uploadedUrl.startsWith("/")) {
          const baseUrl = API_BASE_URL.replace("/api", "");
          uploadedUrl = `${baseUrl}${uploadedUrl}`;
      }
      return uploadedUrl; 
    } catch (error) {
      console.error("Error upload:", error);
      throw new Error(error.message || "Lỗi kết nối khi upload ảnh.");
    }
  };

  const handleGetCurrentLocation = async () => {
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Vui lòng cấp quyền vị trí.");
        setLocating(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const formattedAddress = [addr.street, addr.subregion, addr.city, addr.country]
          .filter((item) => item).join(", ");
        setLocation(formattedAddress);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể lấy vị trí GPS.");
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploading(true);
    let finalAvatarUrl = avatarUri;

    try {
      if (newAvatarSelected && avatarUri) {
        finalAvatarUrl = await uploadImage(avatarUri); 
        setNewAvatarSelected(false);
      }
      setUploading(false);

      const updateData = {
        fullName,
        gender,
        dateOfBirth: birthDate,
        defaultLocation: location,
        phoneNumber: phone,
        avatarUrl: finalAvatarUrl,
      };

      await updateProfile(updateData);
      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!", [
        { text: "OK", onPress: () => router.back() },
      ]);

    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#0A0A0A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={saving}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={80} color="#CCCCCC" />
            )}
            <View style={styles.editIconContainer}>
               <MaterialCommunityIcons name="camera-outline" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          {uploading && <ActivityIndicator style={styles.uploadingIndicator} size="small" color="#007AFF" />}
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nhập họ và tên" placeholderTextColor="#999" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Nam / Nữ" placeholderTextColor="#999" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh (yyyy-MM-dd)</Text>
            <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} placeholder="Ví dụ: 2000-01-01" placeholderTextColor="#999" />
          </View>

          {/* KHU VỰC VỊ TRÍ (CẬP NHẬT GIAO DIỆN) */}
          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Khu vực mặc định (Dữ liệu AQI)</Text>
            
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputWithIconPadding]}
                value={location}
                onChangeText={setLocation}
                placeholder="Nhập thủ công (VD: Quận 1, TP.HCM)"
                placeholderTextColor="#999"
                multiline={true}
                blurOnSubmit={true}
              />
              
              <View style={styles.iconGroup}>
                {/* Nút Xóa */}
                {location.length > 0 && (
                  <TouchableOpacity onPress={() => setLocation("")} style={styles.clearBtn}>
                    <MaterialCommunityIcons name="close-circle" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}

                {/* Nút GPS */}
                <TouchableOpacity 
                  style={styles.gpsBtn} 
                  onPress={handleGetCurrentLocation}
                  disabled={locating || saving}
                >
                  {locating ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Helper Text */}
            <View style={styles.helperContainer}>
              <MaterialCommunityIcons name="information-outline" size={14} color="#666" style={{marginTop: 2, marginRight: 4}} />
              <Text style={styles.helperText}>
                Dữ liệu này dùng để hiển thị chỉ số AQI khi bạn không bật GPS. Bạn có thể nhập tay hoặc dùng icon định vị.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, { backgroundColor: "#F5F5F5", color: "#888", borderColor: '#E0E0E0' }]} value={email} editable={false} />
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Nhập số điện thoại" placeholderTextColor="#999" keyboardType="phone-pad" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (saving || uploading) && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving || uploading}
        >
          {(saving || uploading) ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Lưu thông tin</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ĐÃ ĐƯỢC FORMAT LẠI ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0EFED",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  placeholder: {
    width: 44,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#F0EFED",
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: '#007AFF',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  uploadingIndicator: {
    marginTop: 8,
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...typography.body,
    fontWeight: "bold",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  input: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#007AFF",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E7E5",
    marginVertical: 20,
  },
  inputWithIcon: {
    position: "relative",
    justifyContent: 'center',
  },
  inputWithIconPadding: {
    paddingRight: 80, // Để chừa chỗ cho 2 icon bên phải
  },
  iconGroup: {
    position: "absolute",
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearBtn: {
    padding: 5,
    marginRight: 5,
  },
  gpsBtn: {
    padding: 5,
  },
  helperContainer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 45,
    alignItems: "center",
    elevation: 2,
  },
  saveButtonText: {
    ...typography.h3,
    color: "#FFFFFF",
  },
});

export default EditProfileScreen;