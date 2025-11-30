import React, { useState, useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View, Text } from "react-native";
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Đường dẫn import đúng từ app/_layout.jsx là '../src/...'
import { getToken } from "../src/utils/apiHelper";

const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const router = useRouter();
    const segments = useSegments();

    // 1. Load Fonts (ĐÃ SỬA: Tạm thời tắt load font để tránh lỗi thiếu file)
    useEffect(() => {
        async function loadAppResources() {
            try {
                // NẾU BẠN CÓ FILE FONT, HÃY BỎ COMMENT PHẦN DƯỚI VÀ ĐẢM BẢO FILE TỒN TẠI TRONG assets/fonts/
                /*
                await Font.loadAsync({
                    'SF Pro Display': require('../assets/fonts/SF-Pro-Display-Regular.otf'),
                    'SF Pro Display-Bold': require('../assets/fonts/SF-Pro-Display-Bold.otf'),
                });
                */
            } catch (e) {
                console.warn("Lỗi khi tải font:", e);
            } finally {
                // Giả lập là font đã load xong để app tiếp tục chạy
                setFontsLoaded(true);
            }
        }

        loadAppResources();
    }, []);

    // 2. Auth Check logic
    useEffect(() => {
        if (!fontsLoaded) return;

        const checkAuth = async () => {
            try {
                const token = await getToken();
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
            }
        };

        checkAuth();
    }, [segments, router, fontsLoaded]);

    if (isLoading || !fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#00796B" />
                <Text style={{ marginTop: 10 }}>Đang tải tài nguyên...</Text>
            </View>
        );
    }

    return children;
};

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Slot screenOptions={{ headerShown: false }} /> 
            </AuthProvider>
        </SafeAreaProvider>
    );
}