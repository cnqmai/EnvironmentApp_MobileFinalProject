import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2196F3",
    accent: "#f1c40f",
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="detail"
            options={{ headerShown: false, title: "AQI chi tiết" }}
          />
          <Stack.Screen
            name="settings"
            options={{ headerShown: false, title: "Cài đặt" }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ headerShown: false, title: "Chỉnh sửa hồ sơ" }}
          />
          <Stack.Screen
            name="recycle-guide"
            options={{ headerShown: false, title: "Hướng dẫn tái chế" }}
          />
          <Stack.Screen
            name="recycle-search"
            options={{ headerShown: false, title: "Tìm kiếm rác" }}
          />
          <Stack.Screen
            name="recycle-camera"
            options={{ headerShown: false, title: "Chụp ảnh nhận diện" }}
          />
          <Stack.Screen
            name="settings/aqi-threshold"
            options={{ headerShown: false, title: "Cài đặt ngưỡng cảnh báo" }}
          />
          <Stack.Screen
            name="chat/chat-history"
            options={{ headerShown: false, title: "Đoạn hội thoại" }}
          />
          <Stack.Screen
            name="chat/chatbot"
            options={{ headerShown: false, title: "Chatbot" }}
          />
          <Stack.Screen
            name="chat/chatbot-voice"
            options={{ headerShown: false, title: "Chatbot giọng nói" }}
          />
          <Stack.Screen
            name="settings/history"
            options={{ headerShown: false, title: "Lịch sử hoạt động" }}
          />
          <Stack.Screen
            name="settings/notifications"
            options={{ headerShown: false, title: "Thông báo" }}
          />
          <Stack.Screen
            name="settings/policy"
            options={{ headerShown: false, title: "Chính sách & Điều khoản" }}
          />
          <Stack.Screen
            name="settings/privacy"
            options={{ headerShown: false, title: "Quyền riêng tư" }}
          />
          <Stack.Screen
            name="settings/help"
            options={{ headerShown: false, title: "Trợ giúp" }}
          />
          <Stack.Screen
            name="settings/delete-account"
            options={{ headerShown: false, title: "Xóa tài khoản" }}
          />
          <Stack.Screen
            name="settings/user-guide"
            options={{ headerShown: false, title: "Hướng dẫn sử dụng" }}
          />
          <Stack.Screen
            name="community/index"
            options={{ headerShown: false, title: "Cộng đồng" }}
          />
          <Stack.Screen
            name="community/create-post"
            options={{ headerShown: false, title: "Tạo bài viết" }}
          />
          <Stack.Screen
            name="community/[id]"
            options={{ headerShown: false, title: "Chỉnh sửa bài viết" }}
          />
          <Stack.Screen
            name="community/post/[id]"
            options={{ headerShown: false, title: "Chi tiết bài viết" }}
          />
          <Stack.Screen
            name="community/[id]/events"
            options={{ headerShown: false, title: "Sự kiện cộng đồng" }}
          />
          <Stack.Screen
            name="community/[id]/events/[eventId]"
            options={{ headerShown: false, title: "Chi tiết sự kiện" }}
          />
          <Stack.Screen
            name="community/create-community"
            options={{ headerShown: false, title: "Tạo cộng đồng" }}
          />
          <Stack.Screen
            name="community/create-event"
            options={{ headerShown: false, title: "Tạo sự kiện" }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
