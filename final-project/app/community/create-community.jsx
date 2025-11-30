import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const CreateCommunityScreen = () => {
  const router = useRouter();
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [canPost, setCanPost] = useState("all");
  const [canCreateEvent, setCanCreateEvent] = useState("admin");

  const regions = [
    { id: "hcm", name: "TP. Hồ Chí Minh" },
    { id: "hanoi", name: "Hà Nội" },
    { id: "danang", name: "Đà Nẵng" },
    { id: "cantho", name: "Cần Thơ" },
    { id: "haiphong", name: "Hải Phòng" },
    { id: "other", name: "Khác" },
  ];

  const handleCreate = () => {
    if (!communityName.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên cộng đồng");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập mô tả cộng đồng");
      return;
    }

    Alert.alert(
      "Tạo cộng đồng thành công",
      `Cộng đồng "${communityName}" đã được tạo!`,
      [
        {
          text: "OK",
          onPress: () => router.push("/community"),
        },
      ]
    );
  };

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
            (!communityName.trim() || !description.trim()) &&
              styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!communityName.trim() || !description.trim()}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.createButtonText,
              (!communityName.trim() || !description.trim()) &&
                styles.createButtonTextDisabled,
            ]}
          >
            Tạo
          </Text>
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
          />
          <Text style={styles.charCount}>{communityName.length}/50</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <TextInput
            style={[styles.textInput, styles.textAreaInput]}
            placeholder="Mô tả về cộng đồng của bạn..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ảnh đại diện</Text>
          <TouchableOpacity
            style={styles.imageUploadButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="image-plus" size={40} color="#999" />
            <Text style={styles.imageUploadText}>Thêm ảnh đại diện</Text>
            <Text style={styles.imageUploadSubtext}>
              Nhấn để chọn từ thiết bị
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khu vực hoạt động</Text>
          <View style={styles.regionsGrid}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region.id}
                style={[
                  styles.regionOption,
                  selectedRegion === region.id && styles.regionOptionActive,
                ]}
                onPress={() =>
                  setSelectedRegion(
                    selectedRegion === region.id ? "" : region.id
                  )
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.regionText,
                    selectedRegion === region.id && styles.regionTextActive,
                  ]}
                >
                  {region.name}
                </Text>
                <MaterialCommunityIcons
                  name={
                    selectedRegion === region.id
                      ? "check-circle"
                      : "check-circle-outline"
                  }
                  size={20}
                  color={selectedRegion === region.id ? "#007AFF" : "#CCC"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
  textInput: {
    ...typography.body,
    fontSize: 15,
    color: "#0A0A0A",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    ...typography.small,
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },

  imageUploadButton: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  imageUploadText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
  },
  imageUploadSubtext: {
    ...typography.small,
    fontSize: 11,
    color: "#999",
    marginTop: 4,
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
