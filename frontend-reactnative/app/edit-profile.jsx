import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location"; // Import thư viện Location
import typography from "../styles/typography";
import { getMyProfile, updateProfile } from "../src/services/userService";

const EditProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false); // State loading cho nút lấy vị trí

  // State cho các trường thông tin
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Load dữ liệu khi mở màn hình
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
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM MỚI: LẤY VỊ TRÍ HIỆN TẠI ---
  const handleGetCurrentLocation = async () => {
    setLocating(true);
    try {
      // 1. Xin quyền truy cập vị trí
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Vui lòng cho phép ứng dụng truy cập vị trí để sử dụng tính năng này."
        );
        setLocating(false);
        return;
      }

      // 2. Lấy tọa độ hiện tại
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // 3. Chuyển tọa độ thành địa chỉ (Reverse Geocoding)
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        // Tạo chuỗi địa chỉ từ các thành phần trả về
        const formattedAddress = [
          addr.street,
          addr.subregion, // Quận/Huyện
          addr.city,      // Thành phố/Tỉnh
          addr.country    // Quốc gia (có thể bỏ nếu không cần)
        ]
          .filter((item) => item) // Lọc bỏ các giá trị null/undefined
          .join(", ");

        setLocation(formattedAddress);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại. Vui lòng thử lại.");
    } finally {
      setLocating(false);
    }
  };
  // -------------------------------------

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        fullName,
        gender,
        dateOfBirth: birthDate,
        defaultLocation: location,
        phoneNumber: phone,
      };

      await updateProfile(updateData);
      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={80}
              color="#CCCCCC"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <TextInput
              style={styles.input}
              value={gender}
              onChangeText={setGender}
              placeholder="Nam / Nữ"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh (yyyy-MM-dd)</Text>
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="Ví dụ: 2000-01-01"
              placeholderTextColor="#999"
            />
          </View>

          {/* --- CẬP NHẬT UI PHẦN KHU VỰC --- */}
          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Khu vực</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputWithIconPadding]}
                value={location}
                onChangeText={setLocation}
                placeholder="Nhập địa chỉ hoặc chọn vị trí"
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.inputIconBtn} 
                onPress={handleGetCurrentLocation}
                disabled={locating}
              >
                {locating ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <MaterialCommunityIcons
                    name="crosshairs-gps" // Icon định vị
                    size={24}
                    color="#007AFF"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          {/* -------------------------------- */}

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#F5F5F5", color: "#888" }]}
              value={email}
              editable={false}
            />
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thông tin</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 44,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    position: "relative",
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
    justifyContent: 'center', // Căn giữa icon theo chiều dọc
  },
  inputWithIconPadding: {
    paddingRight: 50, // Tăng padding để không bị icon che chữ
  },
  inputIconBtn: {
    position: "absolute",
    right: 10, // Đặt sát bên phải
    padding: 5,
    zIndex: 1,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  saveButtonText: {
    ...typography.h3,
    color: "#FFFFFF",
  },
});

export default EditProfileScreen;