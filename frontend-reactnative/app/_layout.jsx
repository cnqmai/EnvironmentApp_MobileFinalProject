import React, { useState, useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";
// Đường dẫn import đúng từ app/_layout.jsx là '../src/...'
import { getToken } from "../src/utils/apiHelper";

/**
 * Component này sẽ kiểm tra xác thực và điều hướng người dùng
 */
const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments(); // Lấy đường dẫn hiện tại

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        
        // Kiểm tra xem người dùng có đang ở màn hình login/register không
        // (tabs) -> login hoặc (tabs) -> register
        const inAuthGroup = segments[0] === '(tabs)' && (segments[1] === 'login' || segments[1] === 'register');

        if (!token && !inAuthGroup) {
          // 1. Không có token VÀ không ở trang auth -> Chuyển đến login
          router.replace("/(tabs)/login");
        } else if (token && inAuthGroup) {
          // 2. Có token VÀ đang ở trang auth (ví dụ: vừa login) -> Chuyển đến dashboard
          router.replace("/(tabs)");
        }
        
      } catch (e) {
        console.error("Lỗi khi kiểm tra auth:", e);
        // Nếu có lỗi, vẫn đưa về login
        router.replace("/(tabs)/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Kiểm tra auth khi component mount hoặc đường dẫn thay đổi
    checkAuth();
  }, [segments, router]); // Chạy lại khi đường dẫn thay đổi

  // Hiển thị màn hình loading trong khi kiểm tra token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  // Nếu không loading, hiển thị nội dung (các trang)
  return children;
};

export default function RootLayout() {
  // Bọc toàn bộ ứng dụng trong AuthProvider
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}