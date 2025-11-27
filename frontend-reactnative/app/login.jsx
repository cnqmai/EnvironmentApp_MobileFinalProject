import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../src/services/authService'; 
import { FONT_FAMILY } from '../styles/typography';

// --- QUAN TRỌNG: Import saveToken từ apiHelper để đồng bộ key lưu trữ ---
import { saveToken } from '../src/utils/apiHelper'; 
// -----------------------------------------------------------------------

import { updateProfile } from '../src/services/userService';
import { getCurrentDeviceAddress } from '../src/services/locationService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      // 1. Gọi API đăng nhập
      const data = await login(email, password);
      
      if (data.token) {
        // --- SỬA LỖI 401: Dùng saveToken thay vì AsyncStorage.setItem thủ công ---
        await saveToken(data.token); 
        // -----------------------------------------------------------------------
        
        let userData = data.user;

        // --- TÍNH NĂNG: Tự động cập nhật vị trí ---
        try {
          console.log("Đang lấy vị trí hiện tại...");
          const currentAddress = await getCurrentDeviceAddress();
          
          if (currentAddress) {
            console.log("Đã lấy được vị trí:", currentAddress);
            
            // Cập nhật lên server (Lúc này token đã được lưu đúng nên API này sẽ chạy OK)
            await updateProfile({ defaultLocation: currentAddress });
            
            // Cập nhật vào biến cục bộ để lưu xuống máy
            if (userData) {
                userData = { ...userData, defaultLocation: currentAddress };
            }
          }
        } catch (locError) {
          console.warn("Không thể tự động cập nhật vị trí:", locError);
          // Không chặn đăng nhập nếu lỗi vị trí
        }
        // ------------------------------------------

        // Lưu thông tin user để hiển thị offline/profile
        if (userData) {
             await AsyncStorage.setItem('userData', JSON.stringify(userData));
        }
      }

      // Điều hướng vào trong App
      router.replace('/(tabs)'); 

    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert('Lỗi đăng nhập', error.message || 'Có lỗi xảy ra');
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
        
        <Text style={styles.title}>Đăng nhập</Text>

        <View style={styles.form}>
          
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

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
              style={[styles.loginButton, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
          >
            {loading ? (
               <ActivityIndicator color="#fff" />
            ) : (
               <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>hoặc đăng nhập với</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image 
                source={{uri: 'https://img.icons8.com/color/48/000000/facebook-new.png'}} 
                style={styles.socialIcon} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
               <Image 
                source={{uri: 'https://img.icons8.com/color/48/000000/google-logo.png'}} 
                style={styles.socialIcon} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.guestButton}>
            <Text style={styles.guestText}>Tiếp tục với chế độ khách</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 40,
    alignSelf: 'center',
    fontFamily: FONT_FAMILY, 
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
    marginBottom: 25,
    fontFamily: FONT_FAMILY, 
  },
  forgotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: FONT_FAMILY, 
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a5c6e8',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONT_FAMILY, 
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
    fontFamily: FONT_FAMILY, 
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    paddingVertical: 5,
    paddingHorizontal: 84,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007bff',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  guestButton: {
    backgroundColor: '#F0EFED',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  guestText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: FONT_FAMILY, 
    fontWeight: '600',
  },
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
  registerLink: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONT_FAMILY, 
    fontWeight: '700',
  },
});

export default Login;