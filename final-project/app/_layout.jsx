import { Stack } from "expo-router";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

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
            name="settings/aqi-threshold"
            options={{ headerShown: false, title: "Cài đặt ngưỡng cảnh báo" }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
