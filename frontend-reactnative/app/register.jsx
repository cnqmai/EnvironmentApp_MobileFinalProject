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
import { fetchAndSaveUserLocation } from '../src/services/locationService'; 

// Import FONT_FAMILY
import { FONT_FAMILY } from '../styles/typography'; 

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State hiển thị
  const [loading, setLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();

  // Hàm validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // 1. Validate Input
    if (!email || !isValidEmail(email)) {
        Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ (có @ và tên miền).');
        return;
    }
    if (password.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
        return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!fullName) {
        Alert.alert('Lỗi', 'Vui lòng nhập họ tên.');
        return;
    }
    if (!isAgreed) {
        Alert.alert('Lỗi', 'Vui lòng đồng ý với Điều khoản & Chính sách');
        return;
    }

    setLoading(true);
    try {
      // 2. Gọi API Đăng ký
      await register(fullName, email, password);
      
      // 3. Xử lý lấy vị trí (Tách try-catch riêng)
      try {
        await fetchAndSaveUserLocation();
      } catch (locError) {
        console.log("Không lấy được vị trí ban đầu (không nghiêm trọng):", locError);
      }

      // 4. Thông báo thành công và Chuyển hướng
      Alert.alert(
        'Đăng ký thành công', 
        'Một email xác thực đã được gửi đến hòm thư của bạn. Vui lòng kiểm tra email (cả mục Spam) để kích hoạt tài khoản trước khi đăng nhập.', 
        [{ text: 'Về trang đăng nhập', onPress: () => router.push('/login') }]
      );

    } catch (error) {
      console.log("Lỗi đăng ký:", error);
      Alert.alert('Lỗi đăng ký', error.message || 'Có lỗi xảy ra');
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
            <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Nhập họ và tên" 
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                />
            </View>

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

            {/* Password Input */}
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Nhập mật khẩu (>6 ký tự)"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#999" />
                </TouchableOpacity>
            </View>
            
            {/* Confirm Password Input */}
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#999" />
                </TouchableOpacity>
            </View>
            
            {/* Terms Checkbox - ĐÃ CẬP NHẬT ĐIỀU HƯỚNG */}
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
                    <Text 
                        style={styles.termsLink}
                        onPress={() => router.push('/settings/policy')} 
                    >
                        Điều khoản & Chính sách
                    </Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0088FF',
    borderRadius: 15,
    marginBottom: 20,
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
  eyeIcon: {
    padding: 5,
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
    // Bạn có thể thêm màu để làm nổi bật link
    color: '#007bff', 
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