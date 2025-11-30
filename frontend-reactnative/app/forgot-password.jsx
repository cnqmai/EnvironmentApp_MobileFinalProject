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
// Import services
import { requestPasswordReset } from '../src/services/authService'; 
import { FONT_FAMILY } from '../styles/typography';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validate Email Regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    // 1. Validate Input rỗng
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    // 2. Validate định dạng Email
    if (!isValidEmail(email)) {
        Alert.alert('Lỗi', 'Email không hợp lệ. Vui lòng kiểm tra lại.');
        return;
    }

    setLoading(true);
    try {
      // 3. Gọi API
      // Nếu email không tồn tại, Backend trả về 404 -> authService ném Error -> Nhảy vào catch
      await requestPasswordReset(email);
      
      // 4. Thành công
      Alert.alert(
        'Thành công', 
        'Link đặt lại mật khẩu đã được gửi vào email của bạn. Vui lòng kiểm tra hộp thư.', 
        [{ text: 'OK', onPress: () => router.replace('/login') }] 
      );
    } catch (error) {
      // 5. Hiển thị lỗi từ Backend (VD: "Email này chưa được đăng ký...")
      console.log("Forgot Password Error:", error);
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
            <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Nhập email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
            </View>
            
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

            {/* View trống để đẩy nội dung lên trên */}
            <View style={{ flex: 1, minHeight: 50 }} />

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
  // Sử dụng inputContainer giống Register/Login để đồng bộ
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0088FF',
    borderRadius: 15,
    marginBottom: 40,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  inputField: {
    flex: 1, 
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
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
    marginTop: 20,
  },
  backToLoginText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: FONT_FAMILY, 
    fontWeight: '600',
  },
});

export default ForgotPassword;