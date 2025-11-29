import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // Thêm ActivityIndicator
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../styles/typography";

// *** IMPORT HÀM API MỚI ***
import { deleteMyAccount } from '../../src/services/userService'; 


const DeleteAccountScreen = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false); // State loading mới

  const handleDeleteAccount = () => {
    if (loading) return; // Ngăn chặn double submit

    if (!password || !confirmText) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (confirmText.toLowerCase() !== "xoataikhoan") {
      Alert.alert("Lỗi", 'Vui lòng nhập chính xác chuỗi xác nhận: "xoataikhoan"');
      return;
    }

    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa tài khoản và TẤT CẢ dữ liệu cá nhân vĩnh viễn không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            // Gọi API DELETE: /api/users/me với Body chứa mật khẩu xác nhận
            await deleteMyAccount({ 
                password: password, 
                confirmationText: confirmText.toLowerCase() 
            });

            Alert.alert(
              "Thành công",
              "Tài khoản và toàn bộ dữ liệu của bạn đã được xóa vĩnh viễn.",
              [{
                text: "Đồng ý",
                // Chuyển người dùng về màn hình đăng nhập hoặc màn hình chính (reset stack)
                onPress: () => router.replace("/login") 
              }]
            );
            
          } catch (error) {
            console.error("Lỗi xóa tài khoản:", error);
            // Xử lý lỗi từ backend (401 Unauthorized do mật khẩu sai)
            const errorMessage = error.message.includes("Mật khẩu không chính xác") 
                ? "Mật khẩu không chính xác. Vui lòng thử lại."
                : error.message.includes("401") 
                ? "Mật khẩu không đúng hoặc phiên đăng nhập hết hạn. Vui lòng thử lại."
                : error.message; 
                
            Alert.alert("Lỗi Xóa Tài khoản", errorMessage);

          } finally {
            setLoading(false);
          }
        },
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
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#0A0A0A"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xóa tài khoản</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.mainTitle}>Xóa tài khoản & dữ liệu</Text>
          <Text style={styles.warningText}>
            Khi bạn xóa tài khoản, toàn bộ dữ liệu cá nhân, bảo cáo, điểm thưởng
            và lịch sử sẽ bị xóa vĩnh viễn.{"\n"}
            Hành động này{" "}
            <Text style={styles.boldText}>không thể hoàn tác.</Text>
          </Text>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu (để xác nhận)</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!loading} // Vô hiệu hóa khi đang loading
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nhập &ldquo;xoataikhoan&rdquo;</Text>
              <TextInput
                style={styles.input}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="xoataikhoan"
                placeholderTextColor="#999"
                autoCapitalize="none"
                editable={!loading} // Vô hiệu hóa khi đang loading
              />
            </View>

            <Text style={styles.infoText}>
              Tôi hiểu rằng dữ liệu sẽ bị xóa vĩnh viễn.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
                styles.deleteButton,
                (confirmText.toLowerCase() !== "xoataikhoan" || loading) && styles.deleteButtonDisabled,
            ]}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
            disabled={confirmText.toLowerCase() !== "xoataikhoan" || loading} // Vô hiệu hóa nút
        >
          {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
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

  contentSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  mainTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 12,
  },
  warningText: {
    ...typography.body,
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
  },
  boldText: {
    fontWeight: "700",
    color: "#FF3B30",
  },

  formSection: {
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
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
    borderColor: "#E0E0E0",
  },
  infoText: {
    ...typography.small,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginTop: 4,
  },

  deleteButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  deleteButtonDisabled: {
    backgroundColor: "#FF3B3080", 
  },
  deleteButtonText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default DeleteAccountScreen;