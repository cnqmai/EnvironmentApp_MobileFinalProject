import React from "react";
import { Tabs } from "expo-router";
import { StyleSheet, Platform, View } from "react-native";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import TabOverflowMenu from "../../components/TabOverflowMenu";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00796B",
        tabBarInactiveTintColor: "#555",
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: Platform.OS === "android" ? 70 : 90,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recycle"
        options={{
          title: "Tái chế",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="recycling" size={32} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="notifications" size={28} color={color} />
          ),
          tabBarBadge: 3,
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
              size={28}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <TabOverflowMenu {...props} /> // Component tùy chỉnh của bạn
          ),
        }}
      />
    </Tabs>
  );
};

// Styles gốc từ tệp của bạn
const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 25,
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
    backgroundColor: "#FF6347", // Màu đỏ
    color: "#fff",
    fontSize: 11,
    lineHeight: 14,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    textAlign: "center",
    overflow: "hidden",
    position: "absolute",
    top: 10,
    right: 18,
  },
});

export default TabsLayout;