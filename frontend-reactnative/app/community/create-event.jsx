import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, 
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";
// Import service API giả định để tạo event
import { createCampaign } from "../../src/services/campaignService"; 

const CreateEventScreen = () => {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(""); // Ngày diễn ra (DD/MM/YYYY)
  const [time, setTime] = useState(""); // Thời gian (HH:mm)
  const [maxParticipants, setMaxParticipants] = useState("");
  const [iconCode, setIconCode] = useState("leaf"); 
  const [notifyMembers, setNotifyMembers] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleCreateEvent = async () => {
    // 1. Kiểm tra dữ liệu đầu vào bắt buộc
    if (!eventName.trim() || !description.trim() || !location.trim() || !date.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    // 2. Kiểm tra định dạng ngày/giờ
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
         Alert.alert("Lỗi", "Vui lòng nhập Ngày diễn ra theo định dạng DD/MM/YYYY.");
         return;
    }
    if (time.trim() && !/^\d{1,2}:\d{2}$/.test(time)) {
        Alert.alert("Lỗi", "Vui lòng nhập Thời gian theo định dạng HH:mm.");
        return;
    }

    setIsSubmitting(true);
    
    // 3. Chuẩn bị dữ liệu và chuyển đổi sang ISO 8601
    try {
        const [day, month, year] = date.split('/');
        const [hours, minutes] = (time || '00:00').split(':');
        
        // Tạo chuỗi ISO 8601: YYYY-MM-DDT00:00:00+07:00
        // Đảm bảo month và day có 2 chữ số
        const eventDateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00+07:00`;
        
        const eventData = {
          title: eventName,
          description: description,
          location: location,
          // *** FIX LỖI TÊN TRƯỜNG: DÙNG eventDate ***
          eventDate: eventDateISO, 
          // *******************************************
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null, 
          iconCode: iconCode,
        };

        // 4. GỌI API TẠO SỰ KIỆN
        const newEvent = await createCampaign(eventData); 
        
        // 5. THÀNH CÔNG
        Alert.alert("Thành công", `Đã tạo sự kiện "${newEvent.title || eventName}"!`, [
          {
            text: "OK",
            onPress: () => router.back(), 
          },
        ]);
    } catch (error) {
        console.error("Lỗi tạo sự kiện:", error);
        // Hiển thị thông báo lỗi từ Backend (ví dụ: Định dạng ngày tháng sự kiện không hợp lệ)
        Alert.alert("Lỗi", error.message || "Không thể tạo sự kiện. Vui lòng thử lại.");
    } finally {
        setIsSubmitting(false);
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
                Ngày diễn ra <Text style={styles.required}>*</Text>
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
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Thời gian</Text>
              <View style={styles.inputWithIcon}>
                <MaterialCommunityIcons
                  name="clock"
                  size={20}
                  color="#666"
                />
                <TextInput
                  style={styles.inputWithIconText}
                  placeholder="HH:mm"
                  placeholderTextColor="#999"
                  value={time}
                  onChangeText={setTime}
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
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Icon Sự kiện (Giả định)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: leaf, recycle, calendar-check"
              placeholderTextColor="#999"
              value={iconCode}
              onChangeText={setIconCode}
            />
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <>
                <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#FFFFFF"
                />
                <Text style={styles.createButtonText}>Tạo sự kiện</Text>
                </>
            )}
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