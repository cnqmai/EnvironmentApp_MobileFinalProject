import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { Link, useRouter } from "expo-router";

import { loginUser } from "../src/services/authService";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Vui lòng nhập đủ email và mật khẩu");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await loginUser(trimmedEmail, password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err?.message || "Đăng nhập không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Chào mừng trở lại!
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Hãy đăng nhập để tiếp tục khám phá chất lượng môi trường xung quanh
              bạn.
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
            />
            {!!error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Đăng nhập
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Chưa có tài khoản?
            </Text>
            <Link href="/register" asChild>
              <Button mode="text">Đăng ký ngay</Button>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#4B5563",
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    color: "#6B7280",
  },
});

export default LoginScreen;

