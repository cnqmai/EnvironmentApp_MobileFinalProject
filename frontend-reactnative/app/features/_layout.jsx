import { Stack } from 'expo-router';

export default function FeaturesLayout() {
  return (
    <Stack
      screenOptions={{
        // [QUAN TRỌNG] Tắt header mặc định của hệ thống
        // Vì các màn hình con (daily-tip, quiz...) đã có header tự custom rồi
        headerShown: false, 
        
        // Cấu hình animation khi chuyển trang (tùy chọn)
        animation: 'slide_from_right', 
      }}
    >
      <Stack.Screen 
        name="daily-tip" 
      />
      <Stack.Screen 
        name="quiz" 
      />
      <Stack.Screen 
        name="knowledge" 
      />
      <Stack.Screen 
        name="redeem-points" 
      />
      <Stack.Screen 
        name="reward-points" 
      />
      <Stack.Screen 
        name="badges" 
      />
      {/* Route động cho chi tiết bài viết */}
      <Stack.Screen 
        name="knowledge/[id]" 
      />
    </Stack>
  );
}