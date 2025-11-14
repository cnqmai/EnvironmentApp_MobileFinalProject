import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { login } from "../../src/services/authService";
import { saveToken } from "../../src/utils/apiHelper";
import typography from "../../styles/typography";

const LoginScreen = () => {
  const router = useRouter();
  // SỬA: Đổi 'username' thành 'email'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // SỬA: Kiểm tra 'email'
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      // SỬA: Gửi 'email' và password
      const data = await login(email, password); 
      await saveToken(data.token); 
      
      Alert.alert("Thành công", "Đăng nhập thành công!");
      router.replace("/(tabs)"); 
      
    } catch (error) {
      console.error(error);
      Alert.alert("Đăng nhập thất bại", error.message || "Email hoặc mật khẩu không đúng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="Email" // SỬA: Placeholder
          value={email} // SỬA: value
          onChangeText={setEmail} // SỬA: onChangeText
          autoCapitalize="none"
          keyboardType="email-address" // SỬA: Thêm keyboardType
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title={isLoading ? "Đang xử lý..." : "Đăng nhập"}
          onPress={handleLogin}
          disabled={isLoading}
        />
        
        <TouchableOpacity 
          style={styles.registerLink} 
          onPress={() => router.push("/(tabs)/register")}
        >
          <Text style={styles.registerLinkText}>
            Chưa có tài khoản? <Text style={{fontWeight: 'bold'}}>Đăng ký ngay</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles không đổi
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFED",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    ...typography.body,
    height: 50,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    ...typography.body,
    color: '#00796B',
    fontSize: 15,
  },
});

export default LoginScreen;