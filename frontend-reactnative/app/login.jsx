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
import Constants from 'expo-constants'; 

// Import các thư viện cần thiết cho OAuth2
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';

// Import service
import { login, loginWithGoogle, loginWithFacebook } from '../src/services/authService'; 
import { saveToken } from '../src/utils/apiHelper'; 

// Import FONT_FAMILY
import { FONT_FAMILY } from '../styles/typography'; 

// PHẢI GỌI: Hoàn tất phiên xác thực web trước đó
WebBrowser.maybeCompleteAuthSession();

// Lấy cấu hình từ app.json/app.config.js
const SCHEME = Constants.expoConfig?.scheme || 'finalproject';
const { google, facebookAppId } = Constants.expoConfig?.extra || {}; 

// Tính toán Redirect URI chính xác dựa trên Scheme
const redirectUri = AuthSession.makeRedirectUri({
  native: `${SCHEME}://redirect`, 
});
// console.log("OAuth Redirect URI:", redirectUri); // Debug URI

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // ------------------------------------------
  // 1. Hook Google 
  // ------------------------------------------
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    responseType: 'id_token', 
    androidClientId: google?.androidClientId || 'YOUR_GOOGLE_ANDROID_CLIENT_ID',
    iosClientId: google?.iosClientId || 'YOUR_GOOGLE_IOS_CLIENT_ID',
    webClientId: google?.webClientId || 'YOUR_GOOGLE_WEB_CLIENT_ID',
    scopes: ['profile', 'email'],
    // Không cần redirectUri cho Google nếu đã cấu hình đúng các Client ID
  });

  // ------------------------------------------
  // 2. Hook Facebook 
  // ------------------------------------------
  const [facebookRequest, facebookResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: facebookAppId || 'YOUR_FACEBOOK_APP_ID',
    scopes: ['public_profile', 'email'],
    redirectUri: redirectUri, // SỬ DỤNG REDIRECT URI ĐÃ TẠO
  });

  // ------------------------------------------
  // 3. Hàm lưu token & chuyển hướng
  // ------------------------------------------
  const finishLogin = async (data) => {
    if (data.token) {
      await saveToken(data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user || {}));
    }
    router.replace('/(tabs)');
  };

  // ------------------------------------------
  // 4. Effect theo dõi response Google
  // ------------------------------------------
  React.useEffect(() => {
    if (googleResponse?.type === 'success' && googleResponse.authentication?.idToken) {
      handleSocialLoginFlow('google', googleResponse.authentication.idToken);
    } else if (googleResponse?.type === 'error') {
      Alert.alert('Lỗi Google Login', 'Xác thực Google thất bại.');
      setLoading(false);
    }
  }, [googleResponse]);

  // ------------------------------------------
  // 5. Effect theo dõi response Facebook
  // ------------------------------------------
  React.useEffect(() => {
    if (facebookResponse?.type === 'success' && facebookResponse.authentication?.accessToken) {
      handleSocialLoginFlow('facebook', facebookResponse.authentication.accessToken);
    } else if (facebookResponse?.type === 'error') {
      Alert.alert('Lỗi Facebook Login', 'Xác thực Facebook thất bại.');
      setLoading(false);
    }
  }, [facebookResponse]);

  // ------------------------------------------
  // 6. Hàm gọi API Backend sau khi có token
  // ------------------------------------------
  const handleSocialLoginFlow = async (provider, token) => {
    if (loading) return;
    setLoading(true);
    try {
      let data;
      if (provider === 'google') {
        data = await loginWithGoogle(token); 
      } else if (provider === 'facebook') {
        data = await loginWithFacebook(token);
      }
      
      await finishLogin(data);
      
    } catch (error) {
      Alert.alert(`Lỗi Đăng nhập ${provider}`, error.message);
    } finally {
      setLoading(false);
    }
  };


  // ------------------------------------------
  // 7. Email/Password Login (FR-1.1.1)
  // ------------------------------------------
  const handleLogin = async () => { 
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      await finishLogin(data); 
    } catch (error) {
      Alert.alert('Lỗi đăng nhập', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // ------------------------------------------
  // 8. Kích hoạt Google Login
  // ------------------------------------------
  const handleGoogleLogin = () => {
    if (loading || !googleRequest) return;
    promptGoogleAsync();
  };

  // ------------------------------------------
  // 9. Kích hoạt Facebook Login
  // ------------------------------------------
  const handleFacebookLogin = () => {
    if (loading || !facebookRequest) return;
    promptFacebookAsync();
  };

  // ------------------------------------------
  // 10. Chế độ khách (FR-1.1.2)
  // ------------------------------------------
  const handleGuestLogin = async () => {
    try {
      // Lưu token giả cho Guest Mode (dữ liệu lưu cục bộ, token không dùng cho API)
      await saveToken('GUEST_MODE_LOCAL_TOKEN'); 
      await AsyncStorage.setItem('isGuest', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể vào chế độ khách.');
    }
  };


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title */}
        <Text style={styles.title}>Đăng nhập</Text>

        {/* Form */}
        <View style={styles.form}>
          
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

          {/* FR-1.1.3: Forgot Password */}
          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
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

          {/* Divider "hoặc đăng nhập với" */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>hoặc đăng nhập với</Text>
            <View style={styles.line} />
          </View>

          {/* FR-1.1.1: Social Icons */}
          <View style={styles.socialContainer}>
            {/* Facebook Button */}
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleFacebookLogin}
              disabled={loading || !facebookRequest} 
            >
              <Image 
                source={{uri: 'https://img.icons8.com/color/48/000000/facebook-new.png'}} 
                style={styles.socialIcon} 
              />
            </TouchableOpacity>
            {/* Google Button */}
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleGoogleLogin}
              disabled={loading || !googleRequest} 
            >
               <Image 
                source={{uri: 'https://img.icons8.com/color/48/000000/google-logo.png'}} 
                style={styles.socialIcon} 
              />
            </TouchableOpacity>
          </View>

          {/* FR-1.1.2: Guest Button */}
          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <Text style={styles.guestText}>Tiếp tục với chế độ khách</Text>
          </TouchableOpacity>

          {/* Register Link */}
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
    flex: 1, 
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc', 
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