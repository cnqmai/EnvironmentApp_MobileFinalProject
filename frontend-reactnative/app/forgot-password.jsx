import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
// Import đúng đường dẫn tới authService của bạn
import { requestPasswordReset } from '../src/services/authService'; 
// Import FONT_FAMILY
import { FONT_FAMILY } from '../styles/typography'; // Giả định typography.js nằm ở ../styles/

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      // Gọi API từ authService bạn cung cấp
      await requestPasswordReset(email);
      
      Alert.alert(
        'Thành công', 
        'Link đặt lại mật khẩu đã được gửi vào email của bạn. Vui lòng kiểm tra hộp thư.', 
        [{ text: 'OK', onPress: () => router.push('/login') }] // Điều hướng về màn hình Login
      );
    } catch (error) {
      // Hiển thị message lỗi đã được xử lý từ handleApiError
      Alert.alert('Lỗi', error.message || 'Không thể gửi yêu cầu.');
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
        <Text style={styles.title}>Quên mật khẩu</Text>

        <View style={styles.form}>
            {/* Subtitle mô tả */}
            <Text style={styles.subtitle}>
              Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
            </Text>

            {/* Email Input */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.buttonDisabled]} 
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Gửi yêu cầu</Text>
              )}
            </TouchableOpacity>

            {/* View trống để đẩy nội dung lên trên, nếu nội dung ngắn */}
            <View style={{ flex: 1, marginTop: 50 }} />

            {/* Quay lại đăng nhập (Footer nằm trong ScrollView) */}
            <TouchableOpacity 
              style={styles.backToLoginButton} 
              onPress={() => router.push('/login')}
            >
              <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
    marginTop: 50, 
  },
  subtitle: {
    fontSize: 16,
    paddingHorizontal: 15,
    color: '#000000',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: FONT_FAMILY,
  },
  form: {
    width: '100%',
  },
  // --- LABEL VÀ INPUT (Đồng bộ hóa) ---
  label: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: FONT_FAMILY, 
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#0088FF',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    fontFamily: FONT_FAMILY, 
  },
  // --- SUBMIT BUTTON (Đồng bộ hóa) ---
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 100,
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
  // --- QUAY LẠI ĐĂNG NHẬP (Footer/Button) ---
  backToLoginButton: {
    backgroundColor: '#F0EFED',
    paddingVertical: 15,
    borderRadius: 30, 
    alignItems: 'center',
    marginTop: 100,
  },
  backToLoginText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: FONT_FAMILY, 
    fontWeight: '600',
  },
});

export default ForgotPassword;