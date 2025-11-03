import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import typography from "../styles/typography";
import { updateProfile } from "../src/services/userService";

const EditProfileScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("Lưu Thuý Anh");
  const [gender, setGender] = useState("Nữ");
  const [birthDate, setBirthDate] = useState("01/01/2000");
  const [location, setLocation] = useState("Thành phố Hồ Chí Minh");
  const [email, setEmail] = useState("anh123@gmail.com");
  const [phone, setPhone] = useState("0123456789");

  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (saving) return;
    try {
      setSaving(true);
      const payload = {
        fullName,
        gender,
        birthDate,
        location,
        email,
        phone,
      };
      await updateProfile(payload);
      router.back();
    } catch (e) {
      console.error(e);
      // Có thể thay bằng Toast/Alert nếu có sẵn
    } finally {
      setSaving(false);
    }
  };

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
              name="emoticon-happy-outline"
              size={56}
              color="#666"
            />
          </View>
          <TouchableOpacity style={styles.cameraButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="camera" size={18} color="#0A0A0A" />
          </TouchableOpacity>
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
              placeholder="Nhập giới tính"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Khu vực</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputWithIconPadding]}
                value={location}
                onChangeText={setLocation}
                placeholder="Nhập khu vực"
                placeholderTextColor="#999"
              />
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#0A0A0A"
                style={styles.inputIcon}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
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
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : "Lưu thông tin"}</Text>
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
  avatarEmoji: {
    fontFamily: "SF Pro Display",
    fontSize: 48,
    color: "#0A0A0A",
  },
  cameraButton: {
    position: "absolute",
    bottom: 32,
    left: "50%",
    marginLeft: 40,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#DDD",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
  },
  inputWithIconPadding: {
    paddingRight: 44,
  },
  inputIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
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
