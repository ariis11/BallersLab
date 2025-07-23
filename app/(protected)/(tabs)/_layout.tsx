import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00E6FF",
        tabBarInactiveTintColor: "#A0A4B8",
        tabBarStyle: {
          backgroundColor: "#181C2E",
          borderTopColor: "#23263A",
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          height: 55 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        headerShown: false,
      }}
      backBehavior="order"
      initialRouteName="tournaments"
    >
      <Tabs.Screen
        name="tournaments"
        options={{
          title: "Tournaments",
          tabBarLabel: "Tournaments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="basketball"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tournaments"
        options={{
          title: "My Tournaments",
          tabBarLabel: "My Tournaments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="basketball"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
