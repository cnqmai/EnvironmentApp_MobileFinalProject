import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking'; // Import thêm Linking

import { login, loginWithGoogle } from '../src/services/authService'; 
import { saveToken } from '../src/utils/apiHelper'; 
import { FONT_FAMILY } from '../styles/typography';

// Bắt buộc để nhận Deep Link quay về
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState('');
  const router = useRouter();
  
  // Lấy params từ Deep Link (Ngrok trả về token ở đây)
  const { token, email: emailFromDeepLink, error } = useLocalSearchParams();
  
  // Cấu hình NGROK và Google
  const NGROK_URL = "https://eructative-prodeportation-nikola.ngrok-free.dev";
  const { google } = Constants.expoConfig?.extra || {};
  const webClientId = google?.webClientId; // Chỉ cần Web Client ID

  // --- XỬ LÝ KHI APP ĐƯỢC MỞ LẠI TỪ NGROK ---
  useEffect(() => {
    const handleUrl = ({ url }) => {
      console.log(">>> Link nhận được:", url);

      // 1. QUAN TRỌNG: Nếu là link Reset Password thì bỏ qua ngay
      // Để cho Expo Router tự điều hướng sang trang ResetPassword
      if (url && url.includes('reset-password')) {
        console.log(">>> Đây là link Reset Password, Login component sẽ bỏ qua.");
        return; 
      }

      // 2. Logic cũ: Chỉ xử lý nếu là Google Login
      if (url && url.includes('token=')) {
        try {
          const { queryParams } = Linking.parse(url);
          const token = queryParams?.token;
          const email = queryParams?.email;
          const error = queryParams?.error;

          if (error) {
            Alert.alert("Lỗi", decodeURIComponent(error));
            setLoading(false);
          } else if (token) {
            handleDeepLinkLogin(token, email);
          }
        } catch (e) {
          console.error("Lỗi xử lý link:", e);
          setLoading(false);
        }
      }
    };

    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
        if (url) handleUrl({ url });
    });

    return () => sub.remove();
  }, []);

  // --- HÀM BẮT ĐẦU ĐĂNG NHẬP ---
  const handleSignInGoogle = async () => {
    setLoading(true);
    try {
      // Tự tạo URL đăng nhập Google thủ công
      // Lý do: Để ép Google trả về link Ngrok của bạn
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${webClientId}` +
        `&redirect_uri=${encodeURIComponent(`${NGROK_URL}/api/auth/callback/google`)}` +
        `&response_type=code` + // Lấy code để Backend tự xử lý lấy Token
        `&scope=email%20profile%20openid`;

      console.log("🚀 Đang mở trình duyệt đến:", googleAuthUrl);

      // --- SỬA CHỖ 2: Dùng openBrowserAsync ---
      await WebBrowser.openBrowserAsync(googleAuthUrl);
      
      // Loading vẫn quay để chờ App quay lại và useEffect bắt được Token
    } catch (error) {
      console.log('❌ Lỗi mở trình duyệt:', error);
      setLoading(false);
    }
  };

  const handleDeepLinkLogin = async (jwtToken, userEmail) => {
    try {
      // Token này là do Backend (Spring Boot) đã xử lý và tạo ra
      await saveToken(jwtToken);
      
      // Nếu Backend trả về email thì lưu, không thì thôi
      const userData = userEmail ? { email: userEmail } : {};
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setLoading(false);
      Alert.alert("Thành công", "Đăng nhập Google hoàn tất!");
      router.replace('/(tabs)');
    } catch (error) {
      console.log('❌ Lỗi lưu token:', error);
      Alert.alert('Lỗi', 'Không thể lưu phiên đăng nhập');
      setLoading(false);
    }
  };

  // --- Các hàm Login khác giữ nguyên ---
  const finishLogin = async (data) => {
    if (data && data.token) {
      await saveToken(data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user || {}));
      setLoading(false);
      router.replace('/(tabs)');
    } else {
        setLoading(false);
        Alert.alert("Lỗi", "Server không trả về token.");
    }
  };

  const handleLogin = async () => { 
    if (!email || !password) { Alert.alert('Thông báo', 'Nhập email/pass'); return; }
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
      Alert.alert('Lỗi', "Sai thông tin đăng nhập");
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try { await saveToken('GUEST'); await AsyncStorage.setItem('isGuest', 'true'); router.replace('/(tabs)'); } catch(e){}
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Đăng nhập</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Nhập email" value={email} onChangeText={setEmail} autoCapitalize="none"/>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput style={styles.input} placeholder="Nhập mật khẩu" secureTextEntry={true} value={password} onChangeText={setPassword}/>
          
          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.loginButton, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
             {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Đăng nhập</Text>}
          </TouchableOpacity>

          <View style={styles.dividerContainer}><View style={styles.line} /><Text style={styles.dividerText}>hoặc đăng nhập với</Text><View style={styles.line} /></View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleSignInGoogle} disabled={loading}>
               <Image source={{uri: 'https://img.icons8.com/color/48/000000/google-logo.png'}} style={styles.socialIcon} />
               <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
          </View>
          {googleStatus ? (
            <View style={{alignItems: 'center', marginBottom: 8}}>
              <Text style={{color: '#666'}}>{googleStatus}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <Text style={styles.guestText}>Tiếp tục với chế độ khách</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}><Text style={styles.registerLink}>Đăng ký</Text></TouchableOpacity>
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
    flexDirection: 'row', // Thêm dòng này để icon và text nằm ngang
    flex: 1, 
    paddingVertical: 15,
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
    marginRight: 10, // Thêm khoảng cách giữa icon và text
  },
  socialText: { // Thêm style cho text Google
    fontSize: 16,
    color: '#000',
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
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