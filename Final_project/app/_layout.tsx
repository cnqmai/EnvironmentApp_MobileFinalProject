import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Đảm bảo bạn đã cài @expo/vector-icons

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50', // Màu xanh lá cây cho tab đang hoạt động
        tabBarInactiveTintColor: 'gray',   // Màu xám cho các tab khác
        headerShown: false, // Ẩn tiêu đề mặc định của tab navigator
      }}
    >
      <Tabs.Screen
        name="index" // Tương ứng với file index.tsx (Tab Trang chủ)
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="community" // Tương ứng với file community.tsx (Tab Cộng đồng)
        options={{
          title: 'Cộng đồng',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="report" // Tương ứng với file report.tsx (Tab Báo cáo)
        options={{
          title: 'Báo cáo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="megaphone-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // Tương ứng với file profile.tsx (Tab Cá nhân)
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}