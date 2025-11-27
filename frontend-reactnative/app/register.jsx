import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Import service
import { register } from '../src/services/authService';
import { fetchAndSaveUserLocation } from '../src/services/locationService'; // Import mới

// Import FONT_FAMILY
import { FONT_FAMILY } from '../styles/typography'; 

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  
  const router = useRouter();

  const handleRegister = async () => {
    // Validate cơ bản
    if (!fullName || !email || !password || !confirmPassword) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (!isAgreed) {
        Alert.alert('Lỗi', 'Vui lòng đồng ý với Điều khoản & Chính sách');
        return;
    }

    setLoading(true);
    try {
      // Gọi hàm register
      await register(fullName, email, password);
      
      // --- CẬP NHẬT MỚI: Xin quyền và lấy vị trí ngay lúc này ---
      // Việc này giúp "làm nóng" quyền truy cập vị trí trước khi vào app
      await fetchAndSaveUserLocation();

      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => router.push('/login') }
      ]);
    } catch (error) {
      Alert.alert('Lỗi đăng ký', error.message);
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
        <Text style={styles.title}>Đăng ký</Text>

        <View style={styles.form}>
            {/* Full Name Input */}
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ và tên" 
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />

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

            {/* Password Input */}
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#999"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            
            {/* Confirm Password Input */}
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#999"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            
            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
                <TouchableOpacity style={styles.checkbox} onPress={() => setIsAgreed(!isAgreed)}>
                    <Ionicons 
                        name={isAgreed ? "radio-button-on" : "ellipse-outline"} 
                        size={24} 
                        color={isAgreed ? "#007bff" : "#333"} 
                    />
                </TouchableOpacity>
                <Text style={styles.termsText}>
                    Tôi đồng ý với{' '}
                    <Text style={styles.termsLink}>Điều khoản & Chính sách</Text>
                </Text>
            </View>


            {/* Register Button */}
            <TouchableOpacity 
                style={[styles.registerButton, loading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>
            
            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // --- LAYOUT CHUNG ---
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
    marginBottom: 40, 
    alignSelf: 'center',
    fontFamily: FONT_FAMILY, 
  },
  form: {
    width: '100%',
  },
  // --- LABEL VÀ INPUT ---
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
    marginBottom: 20, 
    fontFamily: FONT_FAMILY, 
  },
  // --- TERMS AND CHECKBOX ---
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  termsText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: FONT_FAMILY, 
  },
  termsLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: FONT_FAMILY, 
    fontWeight: '700',
  },
  // --- REGISTER BUTTON ---
  registerButton: {
    backgroundColor: '#007bff', 
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20, 
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a5c6e8',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONT_FAMILY, 
    fontWeight: '700',
  },
  // --- FOOTER ---
  footer: { 
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 55, 
  },
  footerText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: FONT_FAMILY, 
  },
  loginLink: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONT_FAMILY, 
    fontWeight: '700',
  },
});

export default Register;