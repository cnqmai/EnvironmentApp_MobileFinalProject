import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // ĐÃ SỬA: dùng useLocalSearchParams
import { FONT_FAMILY } from '../styles/typography';
import { resetPassword } from '../src/services/authService'; 

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Lấy token từ URL (ví dụ: /reset-password?token=XYZ)
  const { token } = useLocalSearchParams(); // ĐÃ SỬA: dùng useLocalSearchParams
  
  const router = useRouter();

  // Kiểm tra token khi màn hình được load
  useEffect(() => {
    if (!token) {
      // Nếu không có token, chuyển hướng về Forgot Password
      Alert.alert(
        'Lỗi', 
        'Token đặt lại mật khẩu không hợp lệ. Vui lòng thử lại.', 
        [{ text: 'OK', onPress: () => router.replace('/forgot-password') }]
      );
    }
  }, [token]);

  // Xử lý việc đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Mật khẩu mới và Xác nhận.');
      return;
    }
    if (newPassword !== confirmPassword) {
      // Backend cũng kiểm tra điều này
      Alert.alert('Lỗi', 'Mật khẩu mới và Xác nhận mật khẩu không khớp.'); 
      return;
    }
    
    if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token đặt lại mật khẩu.');
        return;
    }

    setLoading(true);
    try {
      // Gọi API reset mật khẩu, gửi token và mật khẩu
      await resetPassword(token, newPassword, confirmPassword);
      
      // Phản hồi thành công
      Alert.alert(
        'Thành công', 
        'Mật khẩu của bạn đã được đặt lại thành công.', 
        [{ text: 'OK', onPress: () => router.replace('/login') }] 
      );
    } catch (error) {
      // Hiển thị lỗi từ Backend (ví dụ: Token không hợp lệ hoặc đã hết hạn)
      Alert.alert('Lỗi', error.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title */}
        <Text style={styles.title}>Đặt lại mật khẩu</Text>

        <View style={styles.form}>
            {/* Subtitle mô tả */}
            <Text style={styles.subtitle}>
              Nhập mật khẩu mới của bạn và xác nhận để hoàn tất.
            </Text>

            {/* New Password Input */}
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />
            
            {/* Confirm Password Input */}
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
            />
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.buttonDisabled]} 
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
              )}
            </TouchableOpacity>

            {/* Quay lại đăng nhập */}
            <TouchableOpacity 
              style={styles.backToLoginButton} 
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Sử dụng styles đồng bộ với forgot-password.jsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    color: '#000000',
    marginBottom: 20,
    alignSelf: 'center',
    fontFamily: FONT_FAMILY, 
    fontWeight: '700',
    marginTop: 50, 
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: FONT_FAMILY,
    paddingHorizontal: 15,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: FONT_FAMILY, 
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#0088FF',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 40, 
    fontFamily: FONT_FAMILY, 
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a5c6e8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONT_FAMILY, 
    fontWeight: '700',
  },
  backToLoginButton: {
    backgroundColor: '#F0EFED',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 60,
  },
  backToLoginText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: FONT_FAMILY, 
    fontWeight: '600',
  },
});

export default ResetPassword;