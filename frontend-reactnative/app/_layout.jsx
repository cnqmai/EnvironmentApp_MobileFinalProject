import React, { useState, useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View, Text } from "react-native";
import * as Font from 'expo-font'; // Import Font loader
import * as SplashScreen from 'expo-splash-screen'; // Thường được dùng để kiểm soát splash screen

// Đường dẫn import đúng từ app/_layout.jsx là '../src/...'
import { getToken } from "../src/utils/apiHelper";

// Tùy chọn: Giữ splash screen hiển thị cho đến khi tài nguyên được tải
// SplashScreen.preventAutoHideAsync(); 

/**
 * Component này sẽ kiểm tra xác thực và điều hướng người dùng
 */
const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [fontsLoaded, setFontsLoaded] = useState(false); // State mới để kiểm tra font
    const router = useRouter();
    const segments = useSegments(); // Lấy đường dẫn hiện tại

    // 1. Load Fonts
    useEffect(() => {
        async function loadAppResources() {
            try {
                // Tải font SF Pro Display
                // LƯU Ý: Bạn cần đặt các file font SF Pro Display thực tế vào thư mục assets/fonts
                await Font.loadAsync({
                    'SF Pro Display': require('../assets/fonts/SF-Pro-Display-Regular.otf'), // Thay bằng đường dẫn file font của bạn
                    'SF Pro Display-Bold': require('../assets/fonts/SF-Pro-Display-Bold.otf'), 
                    // Thêm các biến thể font khác nếu cần (ví dụ: Medium, Semibold, Light)
                });
            } catch (e) {
                console.warn("Lỗi khi tải font:", e);
            } finally {
                setFontsLoaded(true);
            }
        }

        loadAppResources();
    }, []);

    // 2. Auth Check logic (chỉ chạy khi font đã load)
    useEffect(() => {
        if (!fontsLoaded) return; // Đợi font load xong mới check Auth

        const checkAuth = async () => {
            try {
                const token = await getToken();

                // Kiểm tra Unmatched Routes (login, register, forgot-password)
                const currentSegment = segments[segments.length - 1];
                const isAuthScreen = ['login', 'register', 'forgot-password'].includes(currentSegment);
                const inAppGroup = segments[0] === '(tabs)';

                if (!token && inAppGroup) {
                    router.replace("/login");
                } else if (token && isAuthScreen) {
                    router.replace("/(tabs)");
                }

            } catch (e) {
                console.error("Lỗi khi kiểm tra auth:", e);
                router.replace("/login");
            } finally {
                setIsLoading(false);
                // SplashScreen.hideAsync(); // Tùy chọn: Ẩn splash screen sau khi hoàn tất
            }
        };

        checkAuth();
    }, [segments, router, fontsLoaded]); // Chạy lại khi fontsLoaded thay đổi

    // Hiển thị màn hình loading trong khi kiểm tra token HOẶC đang tải font
    if (isLoading || !fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#00796B" />
                <Text style={{ marginTop: 10 }}>Đang tải tài nguyên...</Text>
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
                {/* Slot mặc định cho các màn hình không khớp (login.jsx) */}
                <Slot screenOptions={{ headerShown: false }} /> 
            </AuthProvider>
        </SafeAreaProvider>
    );
}