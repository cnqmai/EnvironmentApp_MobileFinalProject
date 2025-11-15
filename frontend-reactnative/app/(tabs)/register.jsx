import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { register } from "../../src/services/authService";
import typography from "../../styles/typography";

const RegisterScreen = () => {
  const router = useRouter();
  // SỬA: Đổi 'username' thành 'fullName'
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // SỬA: Kiểm tra 'fullName'
    if (!fullName || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      // SỬA: Gửi 'fullName', email, password
      await register(fullName, email, password); 
      
      Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/(tabs)/login"); 
      
    } catch (error) {
      console.error(error);
      Alert.alert("Đăng ký thất bại", error.message || "Email có thể đã tồn tại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng ký</Text>
        <TextInput
          style={styles.input}
          placeholder="Họ và Tên" // SỬA: Placeholder
          value={fullName} // SỬA: value
          onChangeText={setFullName} // SỬA: onChangeText
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title={isLoading ? "Đang xử lý..." : "Đăng ký"}
          onPress={handleRegister}
          disabled={isLoading}
        />
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
});

export default RegisterScreen;