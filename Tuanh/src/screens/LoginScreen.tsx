import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // 🔥 Sau này bạn chỉ cần gọi API login và kiểm tra token
    // Nếu login thành công → vào MainTabs
    navigation.replace("MainTabs");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        placeholder="Nhập email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={{ alignSelf: "flex-end", marginBottom: 14 }}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgot}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* 🔥 Gọi hàm xử lý login */}
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Đăng nhập</Text>
      </TouchableOpacity>

      <Text style={styles.or}>hoặc đăng nhập với</Text>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialText}>f</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialText}>G</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const BORDER = "#D9D9D9";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingHorizontal: 26,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 26,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },
  forgot: {
    fontSize: 13,
    color: "#007AFF",
  },
  btn: {
    width: "100%",
    height: 48,
    backgroundColor: "#0A84FF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  btnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  or: {
    textAlign: "center",
    color: "#666",
    fontSize: 13,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 22,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  socialText: {
    fontSize: 20,
    fontWeight: "700",
  },
  link: {
    textAlign: "center",
    fontSize: 14,
    color: "#007AFF",
    marginTop: 6,
  },
});
