import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FeaturesLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true, // Hiển thị header mặc định
        headerStyle: {
          backgroundColor: '#F0EFED', // Màu nền giống Dashboard
        },
        headerShadowVisible: false, // Bỏ đường kẻ mờ dưới header
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#0A0A0A',
        },
        headerTintColor: '#0A0A0A', // Màu nút Back
        // Tùy chỉnh nút Back nếu muốn
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0A0A0A" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="daily-tip" 
        options={{ title: 'Mẹo sống xanh' }} 
      />
      <Stack.Screen 
        name="quiz" 
        options={{ title: 'Mini Quiz' }} 
      />
      <Stack.Screen 
        name="knowledge" 
        options={{ title: 'Thư viện kiến thức' }} 
      />
    </Stack>
  );
}