import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

const CreateEventScreen = () => {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [notifyMembers, setNotifyMembers] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  const handleCreateEvent = () => {
    if (!eventName.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên sự kiện");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập mô tả sự kiện");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập địa điểm");
      return;
    }
    if (!startDate.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập ngày bắt đầu");
      return;
    }

    Alert.alert("Thành công", "Đã tạo sự kiện mới!", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
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
            <MaterialCommunityIcons name="close" size={24} color="#0A0A0A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo sự kiện</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Tên sự kiện <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên sự kiện"
              placeholderTextColor="#999"
              value={eventName}
              onChangeText={setEventName}
              maxLength={100}
            />
            <Text style={styles.charCounter}>{eventName.length}/100</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Mô tả <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết về sự kiện"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCounter}>{description.length}/500</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ảnh sự kiện</Text>
            <TouchableOpacity
              style={styles.imageUploadButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="camera-plus"
                size={32}
                color="#007AFF"
              />
              <Text style={styles.uploadButtonText}>Thêm ảnh sự kiện</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Địa điểm <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#666"
              />
              <TextInput
                style={styles.inputWithIconText}
                placeholder="Nhập địa điểm tổ chức"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>
                Ngày bắt đầu <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#666"
                />
                <TextInput
                  style={styles.inputWithIconText}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#999"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Ngày kết thúc</Text>
              <View style={styles.inputWithIcon}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#666"
                />
                <TextInput
                  style={styles.inputWithIconText}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#999"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số lượng tham gia tối đa</Text>
            <View style={styles.inputWithIcon}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color="#666"
              />
              <TextInput
                style={styles.inputWithIconText}
                placeholder="Nhập số lượng (để trống nếu không giới hạn)"
                placeholderTextColor="#999"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Tuỳ chọn khác</Text>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setNotifyMembers(!notifyMembers)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="bell-ring"
                size={24}
                color="#007AFF"
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Thông báo cho thành viên</Text>
                <Text style={styles.optionSubtitle}>
                  Gửi thông báo về sự kiện mới
                </Text>
              </View>
              <Switch
                value={notifyMembers}
                onValueChange={setNotifyMembers}
                trackColor={{ false: "#E5E5E5", true: "#007AFF" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E5E5"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setRequireApproval(!requireApproval)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="calendar-check"
                size={24}
                color="#4CAF50"
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Yêu cầu xác nhận</Text>
                <Text style={styles.optionSubtitle}>
                  Người tham gia cần được phê duyệt
                </Text>
              </View>
              <Switch
                value={requireApproval}
                onValueChange={setRequireApproval}
                trackColor={{ false: "#E5E5E5", true: "#4CAF50" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E5E5"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateEvent}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.createButtonText}>Tạo sự kiện</Text>
          </TouchableOpacity>
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
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.4,
  },
  placeholder: {
    width: 44,
  },

  formSection: {
    paddingHorizontal: 24,
  },

  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  required: {
    color: "#E63946",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#0A0A0A",
    borderWidth: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCounter: {
    ...typography.small,
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },

  imageUploadButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },

  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 0,
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 14,
    color: "#0A0A0A",
  },

  dateRow: {
    flexDirection: "row",
    gap: 12,
  },

  optionsSection: {
    marginTop: 12,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: 2,
  },
  optionSubtitle: {
    ...typography.small,
    fontSize: 12,
    color: "#666",
  },

  buttonContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    elevation: 3,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  createButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default CreateEventScreen;
