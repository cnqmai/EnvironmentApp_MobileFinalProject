import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        title="Cài đặt ngưỡng cảnh báo"
        onPress={() => router.push("/settings/AQIThresholdSettingsScreen")}
      />
    </View>
  );
}
