import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32', // Màu xanh lá chủ đạo
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="recycle"
        options={{
          title: 'Thu gom',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="recycle" size={size} color={color} />
          ),
        }}
      />

      {/* Nút chụp ảnh ở giữa nổi bật (nếu cần) */}
      <Tabs.Screen
        name="camera-placeholder" // Tên tạm, sẽ handle nút này mở camera sau
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons 
                name="camera-iris" 
                size={32} 
                color="#FFF" 
                style={{
                    backgroundColor: '#2E7D32',
                    borderRadius: 30,
                    padding: 10,
                    marginTop: -20, // Đẩy icon lên trên
                    elevation: 5
                }} 
            />
          ),
        }}
        listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault(); // Chặn chuyển tab
              navigation.navigate('recycle-camera'); // Chuyển sang màn hình Camera nằm ngoài tabs
            },
        })}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: 'Mở rộng',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="menu" size={size} color={color} />
          ),
        }}
      />

      {/* Ẩn tab profile đi nếu muốn truy cập từ 'More' hoặc để hiển thị nếu cần */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Ẩn khỏi thanh tab bar nhưng vẫn register route
        }}
      />
    </Tabs>
  );
}