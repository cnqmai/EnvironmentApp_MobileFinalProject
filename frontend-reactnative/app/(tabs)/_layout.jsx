
import React, { useState, useCallback } from "react";
import { Tabs, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StyleSheet, Platform, View } from "react-native";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import TabOverflowMenu from "../../components/TabOverflowMenu";
import { getUnreadCount } from "../../src/services/notificationService";

const TabsLayout = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const params = useLocalSearchParams();

  const fetchUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [params.refreshStamp])
  );

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

          title: "Thông báo",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="notifications" size={28} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={30} color={color} />

          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{

          title: "Thêm",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="dots-horizontal-circle"
              size={30}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <TabOverflowMenu {...props} /> 

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

};

// Styles gốc từ tệp của bạn
const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    paddingTop: 10,
    bottom: -10,
    left: 20,
    right: 20,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5.46,
  },
  badge: {
    backgroundColor: "#FF6347",
    color: "#fff",
    fontSize: 11,
    lineHeight: 14,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    textAlign: "center",
    overflow: "hidden",
    position: "absolute",
    top: -4, 
    right: -4,
  },
});

export default TabsLayout;
