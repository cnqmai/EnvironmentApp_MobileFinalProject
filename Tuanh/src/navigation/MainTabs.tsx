import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/HomeScreen";
import RewardPointsScreen from "../screens/RewardPointsScreen";
import BadgesScreen from "../screens/BadgesScreen";
import RedeemScreen from "../screens/RedeemScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#0A84FF",
        tabBarInactiveTintColor: "#999",

        // 🎨 Thêm icon cho từng tab
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string = "";

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "RewardPoints":
              iconName = focused ? "star" : "star-outline";
              break;
            case "Badges":
              iconName = focused ? "ribbon" : "ribbon-outline";
              break;
            case "Redeem":
              iconName = focused ? "gift" : "gift-outline";
              break;
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="RewardPoints"
        component={RewardPointsScreen}
        options={{ title: "Điểm" }}
      />
      <Tab.Screen
        name="Badges"
        component={BadgesScreen}
        options={{ title: "Huy hiệu" }}
      />
      <Tab.Screen
        name="Redeem"
        component={RedeemScreen}
        options={{ title: "Đổi quà" }}
      />
    </Tab.Navigator>
  );
}
